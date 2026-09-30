from fastapi import FastAPI

from models.review_request import ReviewRequest
from models.review_response import ReviewResponse
from models.fix_request import FixRequest
from models.fix_response import FixResponse

from services.llm_service import LLMService


app = FastAPI()

llm_service = LLMService()


@app.get("/health")
def health():
    return {"status": "AI service is running"}


@app.post("/review", response_model=ReviewResponse)
def review_code(request: ReviewRequest):

    return llm_service.review_code(
        request.filename,
        request.code
    )


@app.post("/fix", response_model=FixResponse)
def fix_code(request: FixRequest):

    return llm_service.fix_code(
        request.filename,
        request.code,
        request.issues
    )