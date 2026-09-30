from services.llm_service import LLMService


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


result = LLMService().review_code("Test.java", code)

print(result)