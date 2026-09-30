import requests


code = """
public class Test {

    public static void main(String[] args) {

        String userInput = "admin";

        String query =
                "SELECT * FROM users WHERE name = "
                + userInput;
    }
}
"""


response = requests.post(
    "http://127.0.0.1:8000/review",
    json={
        "filename": "Test.java",
        "code": code
    }
)

print(response.status_code)
print(response.json())