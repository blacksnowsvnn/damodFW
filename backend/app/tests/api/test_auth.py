import pytest
from httpx import AsyncClient
from app.core.config import settings

@pytest.mark.asyncio
async def test_install_check(client: AsyncClient):
    response = await client.get(f"{settings.API_V1_STR}/install/check")
    assert response.status_code == 200
    # response content depend on whether .env exists in the container
    assert "msg" in response.json()

@pytest.mark.asyncio
async def test_login_invalid_user(client: AsyncClient):
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data=login_data
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email hoặc mật khẩu không chính xác"
