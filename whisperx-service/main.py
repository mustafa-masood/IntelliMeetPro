import os
import tempfile
import shutil
from typing import List

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

os.environ.setdefault("TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD", "true")

import torch  # noqa: E402
import whisperx  # noqa: E402
from whisperx.diarize import DiarizationPipeline  # noqa: E402


class Segment(BaseModel):
    speaker: str
    text: str
    start: float
    end: float


class TranscriptionResponse(BaseModel):
    language: str
    transcript: str
    segments: List[Segment]
    duration: float


app = FastAPI()

device = "cpu"           # keep it stable for now
compute_type = "int8"    # suitable for CPU
batch_size = 16

HF_TOKEN = "YOUR_HF_TOKEN_HERE"  # same token that works in your test script

print(f"Loading WhisperX ASR model on {device} ...")
asr_model = whisperx.load_model("large-v2", device, compute_type=compute_type)

print("Loading diarization model (pyannote)...")
diarize_model = DiarizationPipeline(
    use_auth_token=HF_TOKEN,
    device=device,
)


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_name = tmp.name
        shutil.copyfileobj(file.file, tmp)

    try:
        audio = whisperx.load_audio(tmp_name)

        # 1) ASR
        asr_result = asr_model.transcribe(audio, batch_size=batch_size)
        language = asr_result.get("language", "en")
        duration = float(asr_result.get("duration", 0.0)) if "duration" in asr_result else 0.0

        # 2) Alignment (best-effort)
        try:
            align_model, align_metadata = whisperx.load_align_model(
                language_code=language,
                device=device,
            )
            aligned_result = whisperx.align(
                asr_result["segments"],
                align_model,
                align_metadata,
                audio,
                device,
            )
        except Exception:
            aligned_result = asr_result

        # 3) Diarization (best-effort)
        try:
            diarize_segments = diarize_model(tmp_name)
            final_result = whisperx.assign_word_speakers(diarize_segments, aligned_result)
        except Exception:
            final_result = aligned_result

        # 4) Build segments_out from final_result (final_result is ALWAYS defined now)
        segments_out: List[Segment] = []
        for seg in final_result.get("segments", []):
            text = seg.get("text", "").strip()
            if not text:
                continue
            speaker = seg.get("speaker", "UNKNOWN")
            start = float(seg.get("start", 0.0))
            end = float(seg.get("end", 0.0))

            segments_out.append(
                Segment(
                    speaker=speaker,
                    text=text,
                    start=start,
                    end=end,
                )
            )

        # 5) Full transcript from segments_out only
        full_text = " ".join(s.text for s in segments_out)

        return TranscriptionResponse(
            language=language,
            transcript=full_text,
            segments=segments_out,
            duration=duration,
        )

    finally:
        if os.path.exists(tmp_name):
            os.remove(tmp_name)
