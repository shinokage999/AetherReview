from pydantic import BaseModel
from typing import List


class ReviewIssue(BaseModel):
    type: str
    message: str
    line: int
    severity: str
    suggestion: str


class ReviewResponse(BaseModel):
    filename: str
    issues: List[ReviewIssue]
    summary: str