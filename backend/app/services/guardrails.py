"""
app/services/guardrails.py
--------------------------
Input and Output guardrails for the RAG pipeline.

LEARNING NOTE:
  - Guardrails are filters that sit BEFORE and AFTER the LLM call.
  - INPUT guardrails: block users from asking dangerous/out-of-scope questions.
  - OUTPUT guardrails: ensure the LLM response is safe and grounded in context.
  - This is a simple keyword-based implementation.
    In production, you'd use NLP classifiers or a secondary LLM call.
"""

from loguru import logger

# ---- Blocked patterns for INPUT guardrails ----
BLOCKED_INPUT_PATTERNS = [
    "salary",
    "salaries",
    "confidential",
    "password",
    "api key",
    "secret",
    "credit card",
    "ssn",
    "social security",
]

# ---- Phrases that suggest the LLM is hallucinating (OUTPUT guardrail) ----
HALLUCINATION_SIGNALS = [
    "i think",
    "i believe",
    "as far as i know",
    "i'm not sure but",
    "it might be",
]


class GuardrailViolation(Exception):
    """Raised when an input query violates guardrail rules."""
    pass


def check_input_guardrails(query: str) -> None:
    """
    Scan the user query for blocked patterns.
    Raises GuardrailViolation if a pattern is found.
    """
    query_lower = query.lower()
    for pattern in BLOCKED_INPUT_PATTERNS:
        if pattern in query_lower:
            logger.warning(f"Input guardrail triggered! Pattern: '{pattern}' in query.")
            raise GuardrailViolation(
                f"Your query contains a restricted keyword: '{pattern}'. "
                "Please rephrase or contact HR/IT for assistance."
            )


def check_output_guardrails(answer: str, context_docs: list[str]) -> tuple[str, bool]:
    """
    Scan the LLM output for:
     1. Hallucination signals (uncertain language)
     2. Answers not grounded in retrieved context

    Returns:
        (final_answer, guardrail_triggered: bool)
    """
    answer_lower = answer.lower()
    triggered = False

    # Check for hallucination signals
    for signal in HALLUCINATION_SIGNALS:
        if signal in answer_lower:
            logger.warning(f"Output guardrail triggered! Hallucination signal: '{signal}'")
            triggered = True
            answer = (
                "⚠️ I could not find a confident answer in the available documents. "
                "Please consult the relevant team directly."
            )
            break

    # Check if the answer is grounded (very basic: check if context was provided)
    if not context_docs:
        triggered = True
        answer = "I don't have access to relevant information for this query."

    return answer, triggered
