# Project Overview
The Guitar Reference App is a static web application aimed at helping guitar students learn and reference music theory concepts efficiently. It serves as an interactive reference guide, focusing on visualizations of scales, modes, chords, and their relationships on a guitar fretboard. The app emphasizes ease of use, allowing users to select keys, modes, and scales, and visualize them dynamically.
For the Minimum Viable Product (MVP), the scope is limited to core features that provide immediate value: a shared scale visualization system (e.g., displaying scales across the fretboard) and a notes computation service (a backend logic layer for calculating notes, intervals, and basic music theory elements). These features form the foundation for learning modes like Ionian, exploring chords in a key, and referencing pentatonic scales. Advanced features like full chord progressions, audio integration, or export options are out of scope for MVP.
The app will be built as a single-page application (SPA) using Angular, following the provided development guidelines for modular structure, state management, and best practices.

# Development Guidelines
- Use Angular CLI commands to scaffold ts files
> ng generate component <component-name>
> ng generate service <service-name>
> ng generate pipe <pipe-name>
> ng generate directive <directive-name>
> ng generate guard <guard-name>
> ng generate class <class-name>
> ng generate interface <interface-name>
> ng generate enum <enum-name>

- Keep different types of files in appropriate folders. /services, /coomponents, /guards, /models, etc.
- Use standalone components with lazy loading where ever applicable.