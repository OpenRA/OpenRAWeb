As part of the coverage surrounding the upcoming C&C Rivals game, [Vice Motherboard recently surveyed the various C&C community projects](https://motherboard.vice.com/de/article/gy353m/deshalb-sind-gamer-auch-nach-23-jahren-noch-von-command-and-conquer-besessen), including OpenRA, Twisted Insurrection, and Project Perfect Mod. Due to space constraints only a small portion of our remarks could be included; our full responses in English are shown below:

### Could you introduce yourself? (How old are you? Where do you live? What's your name? What's your role in the OpenRA project? etc.)

CF: My name is Chris Forbes, and I’m one of the three founding members of the OpenRA project. I’m in my early 30s. I’m originally from New Zealand (the early team were all at university in Wellington together), but currently living in the US.

PC: My name is Paul Chote, and I am currently the lead maintainer for OpenRA.  Like Chris, I’m in my early 30s and originally from NZ, but now living in the UK.

CS: My name is Christian Sattler (known as ‘reaperrr’ in most C&C/OpenRA modding places) and I joined OpenRA gradually in the 2013-2014 time-frame. I’m from Germany and in my early 30s (kind of the standard here, it seems).

MBD: My name is Megan Bowra-Dean and I’m another of the founding OpenRA members. I’m also in my early 30s (surprise!) and live in Wellington, New Zealand. I’m not involved in the project at the moment but it is still near and dear to my heart.

CA: Caleb Anderson. I have been an on-again, off-again (mostly off lately) contributor since 2009/2010. I kind of exist to spout opinions occasionally and chase people off my lawn. I’m in my mid 30s and am originally from the USA and still live there.

JAL: Jonas Abraham Lind, known to the community as SoScared, living in Oslo, Norway. Community fanatic since 2011, organizer of various tournaments, and owner of the Red Alert balance work from 2015 to 2017.

### What do you do, when you are not working on OpenRA?

PC: In the real world I am an astronomer, where I develop and operate robotic telescopes to help discover and characterise objects of interest across several research areas (including exoplanets, compact stars, transient events, and space debris).

CF: Outside of OpenRA I’m a software engineer, working on tools and driver quality surrounding the Vulkan graphics API.

CS: I’m a tax clerk in real life, dealing with the atrocities of German tax laws (and with people not willing to deal with those themselves, understandably so).

MBD: I’m a senior programmer at a mobile and console game studio called PikPok based in Wellington, currently working on a multi-platform title due for release later this year.

CA: I run a small software team that builds a whole-slide analysis digital pathology system.

### What was your first encounter with the Command & Conquer series? And at the time, what made the games special for you?

CS: In early 1997, my dad bought C&C95. I just saw him play it and instantly fell in love with that game.

PC: C&C95 was one of the first PC games that I bought for myself as a kid, and I remember being engrossed by the game and infuriated with the difficulty of some of the missions. I rediscovered the series years later after I stumbled across Red Alert 2 through a friend.  After spending far too much time with that game, I went back to fill in the gaps, and continued to follow the later games in the series.

MBD: C&C95 was also my first taste. At the time, my family had just upgraded from a 486 to something a bit more modern for the era, and C&C was my first RTS game. We didn’t have a sound-card so I wasn’t able to enjoy the amazing soundtrack and wonderfully cheesy live-action videos until much later, but the gameplay had me hooked.

### Which of the games is the best?

PC: My favourites were C&C3 and RA2.

CF: I’m most fond of Red Alert 1.

CS: Objectively, the games got better over time. I still like the factions and overall feel of C&C1 (Win95 version) best, though.

MBD: I have the most nostalgia for C&C95 and the lore with tiberium at its center was great, but I think RA1 was always the most fun for me. Both gameplay-wise and story-wise.

CA: I didn’t chase the series very much after C&C. In fact, my first introduction to multiplayer in C&C was OpenRA. Needless to say, I’m terrible.

### Why is the Command & Conquer series still important for you today?

CS: There was always something about the 3 oldest entries (C&C1, RA1, TS) that gripped me. The combined ‘package’ of gameplay, music, story presentation and mission design always just felt more fun and enjoyable to me than any other RTS, regardless of the shortcomings they - objectively speaking - have in some areas.

MBD: Nostalgia is definitely part of it but the gameplay still holds an experience you can’t get from many games these days. Even Starcraft has died a rather unceremonious death and the strategy market is dominated by simplified mobile titles and Japanese tactics games. I think there’s still room in the market to capture a new generation, whether from a C&C inspired title or from something new.

### Why not any other modern RTS game?

CS: I did enjoy WarCraft 3 and the StarCraft 2 trilogy, though more for the story and presentation than the gameplay. Other than that, see my answer to the previous question.

CF: At times we’ve considered doing support for other titles from the same era; the first candidate would be the Age of Empires series, but it’s already well-served by other open source projects (0 AD as an open spiritual successor, and OpenAge as an engine rebuild). Blizzard’s titles would also be interesting, but they’re famously protective of their IP.

### How many people are working on OpenRA?

PC: There are currently four core maintainers for the game project and web infrastructure, plus five or six regular contributors.  A lot of the development comes in the form of one-off contributions from people who want to fix a specific bug or add a feature that they feel is important; in total, about 300 people have directly contributed to OpenRA through GitHub.

### What is the purpose of OpenRA? And why did the project become necessary for the Command & Conquer community?

PC: OpenRA started off as a small hobby project without a grand purpose, but over time it took on a life of its own and now tries to fill two roles within the community: preserving the best parts of the 2/2.5D era games, and providing a platform for the modding community that grew around these titles.

The original first-generation games (C&C and RA1) show their age, both in a technical sense (they require extensive binary patching or emulation to run on modern systems) and in their gameplay.  OpenRA tries to remain faithful to the spirit of the original games while introducing gameplay elements (such as production queues and the fog of war) from the later titles that make the game more enjoyable and interesting to play.  Support for modern operating systems comes as a matter of course from being built from scratch using modern technologies.

CS: We also wanted to create a flexible platform for the modding community, as mods often used to be made on existing, closed-source game engines with all the limitations and issues that come with them. There aren’t any other ‘classic’ 2D RTS engines that I know of that are both open-source and can compete with OpenRA in terms of sheer number of features. Although there aren’t any finished & released examples yet, OpenRA already allows for quite a few neat things that not even RA2YR + Ares supports, and adding even more features is comparatively easy.

### Could you summarize how the project developed since its beginnings? What were major milestones and obstacles?

CF: We started off in 2007 with 3 of us in a basement, still playing a lot of LAN games of RA1, and tweaking the original balance to its limits; at some point asked “how hard can it be to rebuild this in a way that would give us more flexibility.” We built loaders for the various original file formats, a map renderer, some basic unit behavior. There was no multiplayer, and we were tied to Windows as a D3D9 game at that time. It turns out it was actually hard, and we eventually lost interest and shelved it.

In 2009, Git and Github were exploding in popularity, and we decided to migrate all the good bits of what we’d written as students from an aging server box we’d had in the basement onto that service. As part of doing that we got excited about working on the project again and built out most of the core RA mechanics. The freeware release of Red Alert in 2008 helped with this motivation by dramatically increasing the availability of the original game assets. By the end of 2009 we had a crude multiplayer Red Alert.

PC: It was around this time that I got involved, and brought along some new goals for the project. I was the first team member to not be running Windows, and, coming from a background of C&C modding, wanted to be able to build more than just Red Alert 1 on the growing game engine.  We migrated from DirectX to OpenGL and SDL, and took advantage of the Mono runtime to support Linux and OS X.

Many of the core OpenRA gameplay features were implemented during the following couple of years, including the decision to move away from the original RA1 file formats for maps and the game rules to custom and much more flexible formats, and the introduction of the C&C (Tiberian Dawn) mod.

CF: Toward the end of 2010, Reddit discovered OpenRA, and overnight we gained a player base beyond our group of friends, operational challenges in supporting it (which we were completely unprepared for), and also a large number of new contributors. New faces brought with them new goals -- support for Dune 2000, an AI system, single player missions, and new ideas about what the multiplayer experience should be, beyond just “like RA95, but less tank-rushy”.

CA: This overnight jump in popularity brought my first real contributions. (It was actually during the day for me, but the rest of the team, living in NZ, were blissfully unaware.) I propped up the website with new hosting, we moved everything over to it and tried to figure out how to deal with a large influx of interest. This prompted several reactionary development efforts that, with time, eventually found the right responses.

MBD: At this point most of us had finished our studies or were doing postgrad and were thus less able to contribute as we once had. It’s a small miracle that it didn’t go completely off the rails. I learned some pretty harsh lessons about community management, but luckily this was before the kind of toxic blow-ups many game developers face today. We were pretty firm about leading with the vision that we had and I think that saved both our enthusiasm and the integrity of the project.

PC: I bowed out of the project for a couple of years so that I could focus on my PhD research, but returned in 2013 after I built a toy format parser and renderer for the Tiberian Sun voxel format that I thought would be cool to include in OpenRA.  This inadvertently triggered a new goal and a major overhaul of the game engine in order to support Tiberian Sun.  It turns out, not surprisingly, that rebuilding Tiberian Sun was much harder than Red Alert, and so this work has still not been fully completed.

A surprisingly positive review from TotalBiscuit in 2014 gave OpenRA’s multiplayer scene a needed boost.  Since then, the community has been active with organizing events and actively (and sometimes intensely) debating balance and gameplay ideas in order to improve OpenRA as a game and as an e-sports platform.

JAL: OpenRA began adding features dedicated to spectators and game replays starting around 2014.  These extra tools made it easy for tournaments and game-casts to sprawl through the community, fostering yearly events like the Red Alert Global League, which is now coming up to its sixth season. For a niche game that’s pretty good! Expert Shoutcaster ‘FiveAces’ producing weekly YouTube videos since July 2015 is a testament to that development and is still on it this very day.

CS: A few years ago, the engine still had lots of elements that were not very flexible or even completely hard-coded with the C&C/RA mods in mind, but over time we’ve gradually improved or rewritten those parts.

By now, OpenRA has developed into a very moddable, flexible engine with some very interesting non-C&C 3rd-party projects under development, both projects porting other RTS games to OpenRA as well as a few projects with new, unique IP. There’s still work to do to support those projects better, but it’s an important enough milestone that multiple people are seeing and using the engine’s potential already.

### OpenRA focuses on multiplayer – how important is the story and the singleplayer experience of Command & Conquer for you?


PC: I'm not a big multiplayer gamer, so I consider the storyline and single player experience to be very important.  OpenRA tries to cater to players like myself by including a skirmish AI and so far about half of the campaign missions in each mod.  Unfortunately, it takes a lot of work to port the missions and improve the AI, so these areas have developed at a much slower pace to other parts of the project.

CS: Same as PC, basically. If I didn’t have too many other things on my plate already, I’d try to get our remake of the C&C1 campaign finished. Improving the skirmish AI and making an AI that can be used in missions without too much scripting is high on my personal priority list, but it’s easier said than done.

### What is your opinion on Command & Conquer: Rivals (don't hold anything back)?


PC: I’m not interested in that kind of mobile gaming, so honestly I haven’t paid it much attention.  It is a bit disappointing to see the C&C universe used without concern for the series’s lore, but this kind of thing seems to be standard in the mobile gaming space so I don’t fault Rivals specifically for it.

CS: While I’ve actually started to play a mobile game recently (normally I’m a PC gamer through and through), I don’t feel any real interest towards Rivals. I don’t really mind that it uses the C&C brand, but it doesn’t look like the kind of game I’d play on a mobile platform.

MBD: I’m actually optimistic about it. I would love a new PC game in line with the originals, but from what I’ve seen, Rivals looks like a great adaption of RTS gameplay for the limited control mobile devices give. It’s a shame we won’t be getting the rest of the C&C experience with it though, in terms of the ham acting and out-there plotlines.

### And last but not least: What would be your wishes for a new official Command & Conquer game?

PC: I would like to see the series return to its roots by putting an emphasis on story and world-building as part of the core game design and experience.

CS: In my opinion, the games became more complicated and multiplayer-centric over time (map/faction symmetry and pacing over diversity and creativity), slowly driving away more relaxed/casual players. A new C&C should try to get back to something closer to the first games, just with better balancing (but with as asymmetric factions as possible) and modernized graphics/UI (and more creative mission design + story).

