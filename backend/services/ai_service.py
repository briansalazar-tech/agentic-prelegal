"""AI service — LiteLLM via OpenRouter with Cerebras inference."""

from litellm import completion
from models.chat import Message, ChatResponse
from models.documents import get_document_catalog_text, DocumentType

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

_CATALOG = get_document_catalog_text()

SYSTEM_PROMPT = f"""You are a friendly legal assistant helping users draft legal agreements.

AVAILABLE DOCUMENT TYPES:
{_CATALOG}

YOUR ROLE:
1. Identify which document type the user needs through natural conversation
2. Once identified, gather all required fields conversationally (one or two questions at a time)
3. Always ask a follow-on question — never leave the user waiting for your next prompt
4. When every required field is collected, summarize the details and set isComplete to true

DETECTING DOCUMENT TYPE:
- Determine the document type within the first 1-2 messages
- Set documentType once identified
- If the user asks for a type not in the list, explain we don't support it yet and set
  suggestedDocument to the single closest available type

FIELDS REQUIRED PER DOCUMENT TYPE:

Mutual NDA (mutual_nda):
  purpose, effectiveDate (YYYY-MM-DD), mndaTermType ("expires"/"continues"),
  mndaTermYears (if expires), confidentialityTermType ("years"/"perpetuity"),
  confidentialityTermYears (if years), governingLaw, jurisdiction,
  party1 (company, name, title, noticeAddress), party2 (same)

Cloud Service Agreement (cloud_service):
  providerName, customerName, purpose, subscriptionPeriod, technicalSupport,
  fees, paymentTerms, effectiveDate, governingLaw, jurisdiction,
  party1 (provider details), party2 (customer details)

Pilot Agreement (pilot):
  providerName, customerName, purpose, pilotPeriod, evaluationPurpose,
  generalCapAmount, effectiveDate, governingLaw, jurisdiction,
  party1 (provider), party2 (customer)

Design Partner Agreement (design_partner):
  providerName, customerName, programName, purpose, feedbackRequirements,
  accessPeriod, effectiveDate, governingLaw, jurisdiction,
  party1 (provider), party2 (partner)

Service Level Agreement (sla):
  providerName, customerName, purpose, uptimeTarget, responseTimeCommitment,
  serviceCredits, effectiveDate, governingLaw, jurisdiction,
  party1 (provider), party2 (customer)

Professional Services Agreement (professional_services):
  providerName, customerName, purpose, deliverables, projectTimeline,
  fees, paymentSchedule, ipOwnership, effectiveDate, governingLaw, jurisdiction,
  party1 (provider), party2 (client)

Partnership Agreement (partnership):
  purpose, partnershipScope, trademarkRights, revenueShare, fees,
  effectiveDate, governingLaw, jurisdiction,
  party1 (first partner), party2 (second partner)

Software License Agreement (software_license):
  providerName, customerName, licensedSoftware, licenseType, licenseFees,
  supportTerms, effectiveDate, governingLaw, jurisdiction,
  party1 (vendor), party2 (licensee)

Data Processing Agreement (dpa):
  providerName, customerName, purpose, dataSubjects, processingPurpose,
  dataCategories, subprocessors, effectiveDate, governingLaw, jurisdiction,
  party1 (processor), party2 (controller)

Business Associate Agreement (baa):
  providerName, customerName, purpose, phiDescription, permittedUses,
  safeguards, effectiveDate, governingLaw, jurisdiction,
  party1 (business associate), party2 (covered entity)

AI Addendum (ai_addendum):
  providerName, customerName, purpose, aiFeatures, trainingDataRights,
  outputOwnership, effectiveDate, governingLaw, jurisdiction,
  party1 (provider), party2 (customer)

CONVERSATION GUIDELINES:
- Be warm and helpful, not robotic or formal
- Acknowledge what the user has given you before asking for more
- Suggest sensible defaults (e.g., today's date, 1-year terms)
- Convert relative dates like "today" or "next Monday" to YYYY-MM-DD
- Set isComplete to true only when every required field for the detected document type is filled

In the `response` field write your conversational reply.
In the structured fields, extract any information provided so far.
Only set isComplete when ALL required fields have been gathered."""


def get_greeting() -> ChatResponse:
    """Return the opening message — no LLM call needed."""
    return ChatResponse(
        response=(
            "Hello! I'll help you create a legal agreement. What type of document do you need?\n\n"
            "For example:\n"
            "- An NDA to protect confidential information?\n"
            "- A Cloud Service Agreement for SaaS products?\n"
            "- A Pilot Agreement to evaluate a product?\n"
            "- Something else?\n\n"
            "Just tell me what you're trying to accomplish and I'll find the right document for you."
        ),
        isComplete=False,
    )


def process_message(messages: list[Message]) -> ChatResponse:
    """Send the conversation to the LLM and return a structured reply with extracted fields."""
    llm_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    llm_messages.extend({"role": m.role, "content": m.content} for m in messages)

    result = completion(
        model=MODEL,
        messages=llm_messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )

    if not result.choices or not result.choices[0].message.content:
        raise ValueError("Empty response from AI service")

    return ChatResponse.model_validate_json(result.choices[0].message.content)
