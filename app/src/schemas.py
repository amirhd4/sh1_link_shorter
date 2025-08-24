from pydantic import BaseModel, HttpUrl, EmailStr


class URLCreate(BaseModel):
    long_url: HttpUrl


class URLResponse(BaseModel):
    long_url: HttpUrl
    short_url: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str