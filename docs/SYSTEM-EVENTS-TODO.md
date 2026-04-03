# System Events — Chat Messages

## Context
Phase 1-3 of the messaging simplification added system messages for lifecycle events.
This document tracks what's implemented and what remains.

## Implemented

| Event | systemType | Message text | File |
|---|---|---|---|
| Offer sent | `offer_sent` | "Offer sent — $XX/session" | `offer.service.js` |
| Offer accepted | `offer_accepted` | "Offer accepted" | `offer.service.js` |
| Booking created | `booking_created` | "Booking created. Awaiting payment." | `offer.service.js` |
| Offer declined | `offer_declined` | "Offer declined by patient." | `offer.service.js` |
| Offer change requested | `offer_change_requested` | "Patient requested changes: {note}" | `offer.service.js` |
| Offer revised | `offer_revised` | "Offer revised — $XX/session" | `offer.service.js` |
| Offer withdrawn | `offer_withdrawn` | "Offer withdrawn by therapist." | `offer.service.js` |
| Payment confirmed | `payment_confirmed` | "Payment received — session confirmed. ($XX)" | `payment.service.js` |
| Session completed by therapist | `session_completed` | "Session marked complete by therapist. Please confirm within 3 days." | `session.service.js` |
| Session confirmed by customer | `session_confirmed` | "Session confirmed (X/Y). All sessions complete — payment released." | `session.service.js` |

## Remaining — Medium Priority

| Event | systemType | Message text | File | Function |
|---|---|---|---|---|
| Booking cancelled / refund | `booking_cancelled` | "Booking cancelled. Refund initiated." | `payment.service.js` | `processRefund()` |
| Session auto-confirmed | `session_auto_confirmed` | "Session auto-confirmed (3-day window expired)." | `autoConfirm.js` | `runAutoConfirm()` |
| Reschedule proposed | `reschedule_proposed` | "Therapist proposed rescheduling to {date}." | `booking.service.js` | `rescheduleBooking()` |
| Reschedule accepted | `reschedule_accepted` | "Reschedule accepted. New date: {date}." | `booking.service.js` | `respondToReschedule()` |
| Reschedule declined | `reschedule_declined` | "Reschedule declined." | `booking.service.js` | `respondToReschedule()` |
| Offer expired | `offer_expired` | "Offer expired." | `expireOffers.js` | `runExpireOffers()` |
| Session cancelled | `session_cancelled` | "Session cancelled: {reason}" | `session.service.js` | `cancelSession()` |

## Implementation Pattern

```js
import { findOrCreateDirectConversation, createSystemMessage } from "./message.service.js";

findOrCreateDirectConversation(customerUserId, therapistUserId)
    .then((conversation) =>
        createSystemMessage({
            conversationId: conversation.id,
            actorId: <who triggered>,
            recipientId: <other party>,
            content: "<message>",
            systemType: "<event_type>",
            bookingId: booking.id,
            patientId: patientId || null,
        })
    )
    .catch((err) => {
        logger.error("[ServiceName] System message failed", { error: err.message });
    });
```
