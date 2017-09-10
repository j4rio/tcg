# tcg
Study; a side-effect-based code generator

The problem, side-effects:

This is a study about code generation and theory. In most computer languages, a code to e.g. to play music states something like the lines below:

...
var rock_music = downLoad(someURL,"rock");
playMusic(rock_music);
...

The code above is easy-to-read, easy-to-test and most humans can understand the purpose of the code in seconds. The problem is that for the computer the "music" is acoustic sound waves outside the computer box; i.e. it is a side-effect. An AI could try to analyze the function "playMusic" by looking the sound card assembler code and registers. But there is no way outside the box for the computer; the purpose of the program (to play music) is an side-effect that lies outside of its domain of functionality.

We could claim that all operations involving external systems are side-effects. All graphics programs are just side-effect generating programs that shoot photons to observers.

This project is a study where a side-effect code generator is studied.
