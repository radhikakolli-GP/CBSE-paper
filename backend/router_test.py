"""
Try the Ask AI router on its own - no LangGraph install needed, only GROQ_API_KEY.

    cd backend
    export GROQ_API_KEY=your_key
    python3 router_test.py                      # built-in sample questions
    python3 router_test.py "what is power"      # your own question

Prints progress straight away and gives up on any call after 15 seconds,
so it never sits silently.
"""
import os
import sys
import time

import ai_graph

ai_graph.TIMEOUT_SECONDS = 15

SAMPLES = [
    "what is power",
    "power sharing in belgium",
    "solve x^2 - 5x + 6 = 0",
    "tips for the history paper",
    "who won the IPL",
    "hi",
]


def main():
    key = os.environ.get("GROQ_API_KEY", "")
    if not key:
        sys.exit("GROQ_API_KEY is not set in this Terminal window. Run: export GROQ_API_KEY=your_key")
    print(f"Key found ({key[:4]}...). Router model: {ai_graph.ROUTER_MODEL}", flush=True)

    questions = [" ".join(sys.argv[1:])] if len(sys.argv) > 1 else SAMPLES
    for q in questions:
        print(f"\nQ: {q}\n   asking Groq...", end="", flush=True)
        start = time.time()
        try:
            state = ai_graph.route({"question": q, "trace": []})
            took = time.time() - start
            print(f" {took:.1f}s")
            print(f"   subject_group = {state['subject_group']}")
            print(f"   intent        = {state['intent']}")
            print(f"   next step     = {ai_graph.after_route(state)}")
            print(f"   {state['trace'][-1]}")
        except ai_graph.LLMError as e:
            print(f" failed after {time.time() - start:.1f}s\n   {e}")
            if "401" in str(e):
                sys.exit("   The key was rejected - check it at console.groq.com/keys")
            if "Couldn't reach" in str(e) or "timed out" in str(e).lower():
                sys.exit("   Groq could not be reached - check your internet, VPN or office firewall.")
        except Exception as e:
            print(f" failed: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
