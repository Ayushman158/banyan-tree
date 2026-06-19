/* Legal / policy content + overlay modal.
   Single-page app, so policies open as a portalled sheet rather than routed pages.
   Voice mirrors the rest of the site: first-person, root-cause healing practice.

   ⚠️ TODO(client): replace the placeholder contact details below with the real
   business email, location, and (optionally) phone before publishing. These
   values flow into every policy document. */
import { useEffect as _useEffect } from 'react';
import { createPortal as _createPortal } from 'react-dom';
import { X } from 'lucide-react';

const CONTACT = {
  name: "Himanshu Garg",
  role: "Functional Medicine Health Coach",
  email: "hello@example.com",        // ← replace with real contact email
  location: "India",                  // ← replace with city for governing law, e.g. "Pune, India"
};

const EFFECTIVE = "June 2026";        // ← update when the policies are published

/* Each policy: { id, title, sections: [{ h, p?: string[], list?: string[] }] } */
export const POLICIES = [
  {
    id: "privacy",
    title: "Privacy Policy",
    intro: "Your trust matters. This policy explains what information I collect, how I use it, and the care I take to protect it — especially the sensitive health information you share on your healing journey.",
    sections: [
      {
        h: "1 · Who this applies to",
        p: [
          `This policy covers information collected through this website and through my coaching services as ${CONTACT.name}, ${CONTACT.role}. By using this site or enrolling in a program, you agree to the practices described here.`,
        ],
      },
      {
        h: "2 · Information I collect",
        p: ["I collect only what I need to understand your health and guide your care:"],
        list: [
          "Contact details you provide — name, email, phone, and location.",
          "Health information you choose to share — symptoms, medical history, lab reports, diet, lifestyle, and consultation notes.",
          "Program information — bookings, communications, and progress tracking.",
          "Website usage — anonymous data such as pages visited and approximate location, gathered to improve the site.",
        ],
      },
      {
        h: "3 · How I use your information",
        list: [
          "To deliver your consultations, personalise your protocols, and guide your program.",
          "To communicate with you about your care, appointments, and follow-ups.",
          "To respond to your enquiries and provide educational content you've asked for.",
          "To improve this website and my services.",
        ],
      },
      {
        h: "4 · How your health information is protected",
        p: [
          "Your health information is kept confidential. I do not sell, rent, or trade your personal or medical information. It is used only to support your healing and is shared with others solely with your consent, or where required by law.",
        ],
      },
      {
        h: "5 · Sharing & disclosure",
        p: ["Limited sharing happens only in these cases:"],
        list: [
          "With trusted service providers (such as scheduling or payment tools) that help me operate, under confidentiality obligations.",
          "With members of your own care team, only when you authorise it.",
          "Where disclosure is required by law or to protect safety.",
        ],
      },
      {
        h: "6 · Cookies & analytics",
        p: [
          "This site may use cookies and basic analytics to understand how the site is used and to improve it. You can control or disable cookies through your browser settings; some features may not work as intended if you do.",
        ],
      },
      {
        h: "7 · Data retention",
        p: [
          "I keep your information only as long as needed to provide your care, meet legal obligations, and maintain accurate records — after which it is securely deleted or anonymised.",
        ],
      },
      {
        h: "8 · Your rights",
        p: [
          `You may request access to, correction of, or deletion of your personal information at any time by writing to ${CONTACT.email}. I'll respond within a reasonable timeframe, subject to any records I'm required to retain.`,
        ],
      },
      {
        h: "9 · Children",
        p: [
          "This website and these services are intended for adults aged 18 and over and are not directed at children.",
        ],
      },
      {
        h: "10 · Third-party links",
        p: [
          "This site may link to other websites. I'm not responsible for the privacy practices or content of those sites; please review their policies separately.",
        ],
      },
      {
        h: "11 · Changes to this policy",
        p: [
          "I may update this policy from time to time. The latest version will always be available here, with the effective date noted above.",
        ],
      },
      {
        h: "12 · Contact",
        p: [`Questions about your privacy? Write to ${CONTACT.email}.`],
      },
    ],
  },

  {
    id: "terms",
    title: "Terms & Conditions",
    intro: "These terms govern your use of this website and participation in my programs. Please read them carefully — enrolling or using this site means you accept them.",
    sections: [
      {
        h: "1 · Acceptance",
        p: [
          `By accessing this website or enrolling in a program offered by ${CONTACT.name}, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this site or its services.`,
        ],
      },
      {
        h: "2 · The services I provide",
        p: [
          "I offer functional-medicine and Ayurveda-informed health coaching focused on root-cause healing. This is educational and supportive coaching based on the information you provide — it is not medical treatment, diagnosis, or emergency care.",
          "I do not manage acute or emergency health conditions. You must keep your own physician or primary-care provider for diagnosis, prescriptions, and emergencies.",
        ],
      },
      {
        h: "3 · Eligibility",
        p: ["You must be at least 18 years old to enrol in a program or use these services."],
      },
      {
        h: "4 · Bookings & payments",
        p: [
          "Program fees are shown at the time of booking and are payable in full to confirm your place. Bookings are subject to the Refund & Cancellation Policy.",
        ],
      },
      {
        h: "5 · Your responsibilities",
        list: [
          "Provide accurate, complete, and honest information about your health.",
          "Tell me promptly about any changes to your health, medication, or treatment.",
          "Follow the agreed dietary, supplement, and lifestyle recommendations to the best of your ability.",
          "Continue working with your own medical doctor alongside this program.",
        ],
      },
      {
        h: "6 · Not a substitute for medical care",
        p: [
          "Nothing I provide replaces the advice of a qualified physician. Always consult your doctor before making changes to medication or treatment, and never delay seeking medical care because of guidance received here.",
        ],
      },
      {
        h: "7 · No guaranteed outcomes",
        p: [
          "Healing depends on your biology, your circumstances, and your participation. While I bring my full expertise and commitment, I cannot and do not guarantee any specific result. Testimonials reflect individual experiences and are not a promise of similar outcomes.",
        ],
      },
      {
        h: "8 · Intellectual property",
        p: [
          "All content on this site — text, design, illustrations, and protocols — is owned by or licensed to me and is protected by law. You may not reproduce, republish, or redistribute it without written permission.",
        ],
      },
      {
        h: "9 · Limitation of liability",
        p: [
          "To the fullest extent permitted by law, I am not liable for any indirect or consequential loss, or for outcomes arising from non-disclosure of medical conditions or non-adherence to the agreed protocol.",
        ],
      },
      {
        h: "10 · Indemnification",
        p: [
          "You agree to hold harmless and indemnify me from claims arising out of your misuse of this site, your provision of inaccurate information, or your failure to follow medical advice.",
        ],
      },
      {
        h: "11 · Governing law",
        p: [
          `These terms are governed by the laws of ${CONTACT.location}, and any disputes fall under the exclusive jurisdiction of its courts.`,
        ],
      },
      {
        h: "12 · Contact",
        p: [`For any questions about these terms, write to ${CONTACT.email}.`],
      },
    ],
  },

  {
    id: "refund",
    title: "Refund & Cancellation Policy",
    intro: "My programs are commitment-based. Please read this policy carefully before booking, as all enrolments are final.",
    sections: [
      {
        h: "1 · All bookings are final",
        p: [
          "Once a program or consultation has been booked and payment has been made, it cannot be cancelled or refunded for any reason whatsoever.",
        ],
      },
      {
        h: "2 · No exceptions",
        p: [
          "This applies to all circumstances, including — but not limited to — schedule conflicts, time constraints, personal situations, an inability to follow the protocol, or dissatisfaction with the services. No partial refunds, substitutions, or cancellations are offered.",
        ],
      },
      {
        h: "3 · Why this policy exists",
        p: [
          "Root-cause healing is a guided commitment. From the moment you enrol, time, lab interpretation, and a personalised protocol are reserved and prepared specifically for you. This policy reflects that dedicated, upfront investment in your care.",
        ],
      },
      {
        h: "4 · Rescheduling individual sessions",
        p: [
          "While fees are non-refundable, I'll do my best to accommodate the rescheduling of an individual consultation when you give reasonable advance notice. Rescheduling is a courtesy, not a right, and does not change the non-refundable nature of your enrolment.",
        ],
      },
      {
        h: "5 · Contact",
        p: [`If you have questions before booking, please ask — write to ${CONTACT.email} and I'll be glad to help.`],
      },
    ],
  },

  {
    id: "consent",
    title: "Consent Terms",
    intro: "Before beginning a program, I want you to understand exactly what you're agreeing to. Enrolling confirms your consent to the terms below.",
    sections: [
      {
        h: "1 · Informed participation",
        p: [
          "You acknowledge that the nature of the program and its protocol have been explained to you, and that you've had the opportunity to ask questions and have them answered before beginning.",
        ],
      },
      {
        h: "2 · Not emergency or acute care",
        p: [
          "You understand that I do not handle acute or emergency health conditions. You will maintain your own primary-care physician and seek immediate medical attention for any emergency.",
        ],
      },
      {
        h: "3 · Keeping me informed",
        p: [
          "You agree to promptly inform me of any change in your medical condition, diagnosis, or medication that could affect your program, so your protocol can be adjusted safely.",
        ],
      },
      {
        h: "4 · Commitment to the protocol",
        p: [
          "You understand that following the agreed dietary, supplement, and lifestyle recommendations is essential to your results. Sustained non-adherence may lead to discontinuation of the program without refund eligibility.",
        ],
      },
      {
        h: "5 · Use of your information",
        p: [
          "You consent to your health information being used to guide your care. Where your data is used for research, teaching, or publication, it will be anonymised so you cannot be identified.",
        ],
      },
      {
        h: "6 · Supportive therapies",
        p: [
          "You consent to recommendations for supportive practices — such as breathwork, meditation, or nervous-system regulation — as part of a whole-person approach to healing.",
        ],
      },
      {
        h: "7 · Release & responsibility",
        p: [
          "You take responsibility for implementing the guidance you receive and accept that outcomes depend on your participation. You release me from claims arising from non-disclosure of medical conditions or non-adherence to the agreed protocol.",
        ],
      },
      {
        h: "8 · Voluntary consent",
        p: [
          "Your participation is entirely voluntary. By enrolling, you confirm that you've read and understood these terms and consent to them freely.",
        ],
      },
    ],
  },
];

export function PolicyModal({ policy, onClose }) {
  _useEffect(() => {
    if (!policy) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [policy, onClose]);

  if (!policy) return null;

  return _createPortal(
    <div className="policy-modal" role="dialog" aria-modal="true" aria-labelledby="policy-title" onClick={onClose}>
      <div className="policy-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="policy-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="policy-modal__scroll">
          <span className="policy-modal__eyebrow">{CONTACT.name} · Legal</span>
          <h2 id="policy-title" className="policy-modal__title">{policy.title}</h2>
          <p className="policy-modal__meta">Effective {EFFECTIVE}</p>
          {policy.intro && <p className="policy-modal__intro">{policy.intro}</p>}
          {policy.sections.map((s, i) => (
            <section className="policy-section" key={i}>
              <h3 className="policy-section__h">{s.h}</h3>
              {s.p && s.p.map((para, j) => (
                <p className="policy-section__p" key={j}>{para}</p>
              ))}
              {s.list && (
                <ul className="policy-section__list">
                  {s.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
