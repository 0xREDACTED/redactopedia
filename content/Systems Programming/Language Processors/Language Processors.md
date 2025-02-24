---
title: Language Processors
tags:
  - language-processors
---
## Background

At their core, computers are glorified light switches. Every video game you play, website you visit, and keystroke you make boils down to microscopic transistors – billions of tiny switches – flipping between "on" (1) and "off" (0). This binary language is the _only_ thing hardware understands. Want to display the letter "A" on this screen? That’s `01000001`. Play a song? A storm of 1s and 0s orchestrate the speakers.

Now imagine building such complex programs by individually typing out every single 1 and 0. Early programmers faced this nightmare, painstakingly writing raw binary or cryptic machine code (e.g., `8B 5D 08` to move data). To escape this tedium, we created **programming languages** – layers of abstraction that let us write human-friendly instructions like `print("Hello")` or `if user_clicks_button { ... }`. These languages act as intermediaries, shielding us from the chaos of 1s and 0s while relying on **language processors** to quietly handle the translation behind the scenes.

>**TODO:** add intro into core components
## Core components

>**TODO:** reference core components and write them

## Language-specific Implementations

An important thing to remember is that programming languages are abstract specifications - like blueprints for a house. Rather than a language being *defined* by some single source code of truth, their syntax and behaviour are defined in technical documents (e.g the [C++ ISO Standard](https://isocpp.org/std/the-standard) & the [Python Language Reference](https://docs.python.org/3/reference/index.html))
The **language processors** are the *builders* that turn those blueprints into actual houses (executable and running programs). This means that the same language can have multiple implementations

Different programming language implementations use a mixture of No language has the **exact** same process as another (with the exception of c and c++). Languages themselves can even have different ways of processing. 

[[content/Programming/Languages/C++/Compilation Process|C++]]

