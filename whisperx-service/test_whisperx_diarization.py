# ----- FIX FOR PYTORCH 2.6 -----
import torch
import omegaconf

torch.serialization.add_safe_globals([
    omegaconf.listconfig.ListConfig,
    omegaconf.dictconfig.DictConfig,
    omegaconf.base.Container,
    omegaconf.base.ContainerMetadata,
])
# --------------------------------

import whisperx
from whisperx.diarize import DiarizationPipeline
import gc

device = "cuda"
audio_file = "sample.mp3"
batch_size = 16
compute_type = "int8"

hf_token = "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"

# 1. TRANSCRIBE
model = whisperx.load_model("large-v2", device, compute_type=compute_type)
audio = whisperx.load_audio(audio_file)
result = model.transcribe(audio, batch_size=batch_size)
print(result["segments"])

del model
torch.cuda.empty_cache()

# 2. ALIGN
model_a, metadata = whisperx.load_align_model(result["language"], device)
result = whisperx.align(result["segments"], model_a, metadata, audio, device)

del model_a
torch.cuda.empty_cache()

# 3. DIARIZATION
diarize_model = DiarizationPipeline(
    use_auth_token=hf_token,
    device=device
)

diarize_segments = diarize_model(audio)
result = whisperx.assign_word_speakers(diarize_segments, result)

print(diarize_segments)
print(result["segments"])
