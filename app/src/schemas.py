from pydantic import BaseModel, HttpUrl

class URLCreate(BaseModel):
    long_url: HttpUrl

class URLResponse(BaseModel):
    long_url: HttpUrl
    short_url: str

    class Config:
        orm_mode = True