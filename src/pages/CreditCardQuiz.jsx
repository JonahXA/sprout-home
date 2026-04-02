import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { ArrowLeft, CreditCard } from "lucide-react";
import InteractiveQuiz from "@/components/shared/InteractiveQuiz";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 bg:"#FFFFFF", border:"#E5E7EB", bgSoft:"#F8FAFC",
 text:"#0F172A", textSub:"#475569",
};

const quizQuestions = [
 {
 question: "What is your 'New Balance' on a credit card statement?",
 scenario: "You're looking at your statement and see: Previous Balance: $500, New Purchases: $200, Payments: $300, New Balance: $400",
 options: [
 "Only the new purchases you made",
 "The total amount you owe right now",
 "The minimum payment you must make",
 "Your available credit remaining"
 ],
 correct_answer: 1,
 explanation: "New Balance is the total amount you currently owe on the card. It includes your previous balance plus new purchases, minus any payments made. In this case: $500 + $200 - $300 = $400."
 },
 {
 question: "If you only pay the Minimum Payment, what happens?",
 scenario: "Your statement shows: New Balance: $1,000, Minimum Payment: $25, APR: 18%",
 options: [
 "You avoid all interest charges",
 "You'll be charged interest on the remaining balance",
 "Your credit score improves faster",
 "The card gets canceled automatically"
 ],
 correct_answer: 1,
 explanation: "Paying only the minimum means you'll carry a balance and be charged interest (18% APR) on the remaining $975. To avoid interest, you must pay the full New Balance by the due date."
 },
 {
 question: "What does APR stand for and what does it mean?",
 options: [
 "Annual Payment Rate - how much you pay yearly",
 "Annual Percentage Rate - the yearly interest rate on unpaid balances",
 "Automatic Payment Reminder - when payments are due",
 "Average Purchase Rate - your typical spending amount"
 ],
 correct_answer: 1,
 explanation: "APR is Annual Percentage Rate. It's the yearly interest rate charged on any balance you don't pay off. An 18% APR means you're charged 1.5% per month on unpaid balances."
 },
 {
 question: "You see $50 in 'Finance Charges' on your statement. What is this?",
 scenario: "Last month you had a $2,000 balance and paid $500. This month shows $50 Finance Charge.",
 options: [
 "A fee for using the credit card",
 "Interest charged on the unpaid balance from last month",
 "A reward for making a payment",
 "A charge for new purchases"
 ],
 correct_answer: 1,
 explanation: "Finance Charges are the interest charges on your unpaid balance. Since you carried a $1,500 balance ($2,000 - $500 payment), you were charged interest on that amount."
 },
 {
 question: "Your Payment Due Date is March 15. When should you pay to avoid interest?",
 options: [
 "Anytime in March",
 "By March 15 to avoid late fees, by the statement closing date to avoid interest",
 "The day you make a purchase",
 "It doesn't matter when you pay"
 ],
 correct_answer: 1,
 explanation: "You must pay by the Due Date to avoid late fees. But to avoid ALL interest, you need to pay the full balance by the Statement Closing Date (usually 21-25 days before the due date). The period between is called the 'grace period.'"
 },
 {
 question: "What's the difference between 'Available Credit' and 'Credit Limit'?",
 scenario: "Your statement shows: Credit Limit: $5,000, New Balance: $1,200, Available Credit: $3,800",
 options: [
 "They're the same thing",
 "Available Credit is what you can still spend; Credit Limit is your total maximum",
 "Available Credit includes interest; Credit Limit doesn't",
 "Available Credit resets monthly; Credit Limit doesn't"
 ],
 correct_answer: 1,
 explanation: "Credit Limit ($5,000) is the maximum you can borrow. Available Credit ($3,800) is what you can still spend right now. Calculation: $5,000 Credit Limit - $1,200 Current Balance = $3,800 Available."
 },
 {
 question: "You made a $100 purchase on March 1. Statement closes March 20. Due date is April 15. When are you charged interest?",
 options: [
 "Immediately on March 1",
 "On March 20 when the statement closes",
 "Only if you don't pay in full by April 15",
 "Never, purchases are interest-free"
 ],
 correct_answer: 2,
 explanation: "Credit cards have a grace period (usually 21-25 days after statement closes). If you pay the FULL balance by April 15, you pay NO interest. Interest only starts if you carry a balance past the due date."
 }
];

export default function CreditCardQuiz() {
 const navigate = useNavigate();

 const handleComplete = (score) => {
 navigate(createPageUrl("Learn"));
 };

 return (
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>
 <button
 onClick={() => navigate(createPageUrl("CreditCardLesson"))}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}
 >
 <ArrowLeft size={16} />
 Back to Lesson
 </button>

 <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
 <div style={{ display:"inline-flex", padding:16, background:C.navy, borderRadius:20, boxShadow:`0 8px 24px ${C.navyGlow}`, marginBottom:8 }}>
 <CreditCard size={48} color="#fff" />
 </div>
 <h1 style={{ fontSize:40, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:0 }}>
 Credit Card Statement Quiz
 </h1>
 <p style={{ fontSize:17, color:C.textSub, maxWidth:560, margin:0 }}>
 Test your knowledge with real scenarios. Can you make the right financial decisions?
 </p>
 </div>

 <InteractiveQuiz questions={quizQuestions} onComplete={handleComplete} />

 <div style={{ background:C.bgSoft, borderRadius:16, border:`1px solid ${C.border}`, padding:24, textAlign:"center" }}>
 <h3 style={{ fontSize:16, fontWeight:800, color:C.text, margin:"0 0 8px" }}>Pro Tip</h3>
 <p style={{ fontSize:14, color:C.textSub, margin:0 }}>
 The best way to use a credit card is to pay the full balance every month.
 This builds credit without costing you anything in interest!
 </p>
 </div>
 </div>
 </div>
 );
}
