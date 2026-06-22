"""Pydantic models for the chat API."""

from typing import Optional, Literal
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class PartyInfoExtraction(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class ChatResponse(BaseModel):
    """Combined AI reply and incrementally extracted document fields.

    The AI returns this as structured output on every turn. Fields that
    haven't been gathered yet are omitted (None), so callers should merge
    each response into their running form-data state.
    """

    response: str
    isComplete: bool = False

    # Document type routing
    documentType: Optional[str] = None
    suggestedDocument: Optional[str] = None  # closest match when unsupported type requested

    # Fields common to all document types
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None

    # Mutual NDA
    mndaTermType: Optional[Literal["expires", "continues"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetuity"]] = None
    confidentialityTermYears: Optional[int] = None
    modifications: Optional[str] = None

    # Cloud Service Agreement
    providerName: Optional[str] = None
    customerName: Optional[str] = None
    subscriptionPeriod: Optional[str] = None
    technicalSupport: Optional[str] = None
    fees: Optional[str] = None
    paymentTerms: Optional[str] = None

    # Pilot Agreement
    pilotPeriod: Optional[str] = None
    evaluationPurpose: Optional[str] = None
    generalCapAmount: Optional[str] = None

    # Design Partner Agreement
    programName: Optional[str] = None
    feedbackRequirements: Optional[str] = None
    accessPeriod: Optional[str] = None

    # Service Level Agreement
    uptimeTarget: Optional[str] = None
    responseTimeCommitment: Optional[str] = None
    serviceCredits: Optional[str] = None

    # Professional Services Agreement
    deliverables: Optional[str] = None
    projectTimeline: Optional[str] = None
    paymentSchedule: Optional[str] = None
    ipOwnership: Optional[str] = None

    # Partnership Agreement
    partnershipScope: Optional[str] = None
    trademarkRights: Optional[str] = None
    revenueShare: Optional[str] = None

    # Software License Agreement
    licensedSoftware: Optional[str] = None
    licenseType: Optional[str] = None
    licenseFees: Optional[str] = None
    supportTerms: Optional[str] = None

    # Data Processing Agreement
    dataSubjects: Optional[str] = None
    processingPurpose: Optional[str] = None
    dataCategories: Optional[str] = None
    subprocessors: Optional[str] = None

    # Business Associate Agreement
    phiDescription: Optional[str] = None
    permittedUses: Optional[str] = None
    safeguards: Optional[str] = None

    # AI Addendum
    aiFeatures: Optional[str] = None
    trainingDataRights: Optional[str] = None
    outputOwnership: Optional[str] = None

    # Party information (present on every document type)
    party1: Optional[PartyInfoExtraction] = None
    party2: Optional[PartyInfoExtraction] = None
