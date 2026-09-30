from pydantic import BaseModel


class FixRequest(BaseModel):
    filename: str
    code: str
    issues: list