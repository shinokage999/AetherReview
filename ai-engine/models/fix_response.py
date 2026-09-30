from pydantic import BaseModel


class FixResponse(BaseModel):
    filename: str
    fixedCode: str
    summary: str