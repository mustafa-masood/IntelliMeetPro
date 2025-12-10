from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List

app = FastAPI()

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

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile = File(...)):
    # For now, ignore actual audio and return mock data
    return TranscriptionResponse(
        language="en",
        transcript="This is a mock transcript returned by the Python service.",
        segments=[
            Segment(
                speaker="SPEAKER_1",
                text="Hello, thanks for joining the meeting.",
                start=0.0,
                end=5.0
            )
        ],
        duration=300.0
    )
