"""Keep all multiple-choice assessment content within the 127-slide deck.

Replacements preserve five 24-question forms. The readings and conference
handouts remain available for the other study material and written responses.
"""
import random

def apply_slide_scope(tests):
    questions={q['id']:q for t in tests for q in t['questions']}
    revised=set()
    def s(first,last=None): return {'kind':'slides','first':first,'last':last or first}
    def replace(id,stem,correct,wrong,explanation,sources,statements=None,chronology=False):
        q=questions[id]
        options=[correct]+wrong
        random.Random(191400+int(id[1])*100+int(id[-2:])).shuffle(options)
        for key in ['statements','chronology']:q.pop(key,None)
        q.update(stem=stem,options=options,answer=options.index(correct),explanation=explanation,sources=sources)
        if statements:q['statements']=statements
        if chronology:q['chronology']=True
        revised.add(id)
    def combo(id,stem,statements,correct,explanation,sources):
        choices=['A only','B only','C only','A and B only','A and C only','B and C only','All three (A, B, and C)']
        replace(id,stem,correct,[a for a in choices if a!=correct],explanation,sources,statements=statements)
    def cite(id,sources,explanation=None):
        questions[id]['sources']=sources
        if explanation:questions[id]['explanation']=explanation

    replace('t1-q07','Which sequence places these slide-deck events from oldest to newest?',
      'Sarajevo assassination → Battle of the Somme → U.S. entry → armistice',
      ['Battle of the Somme → Sarajevo assassination → U.S. entry → armistice','Sarajevo assassination → U.S. entry → Battle of the Somme → armistice','Sarajevo assassination → Battle of the Somme → armistice → U.S. entry','U.S. entry → Sarajevo assassination → Battle of the Somme → armistice'],
      'The assassination was in June 1914, the Somme in 1916, U.S. entry in April 1917, and the armistice in November 1918.',[s(34),s(79),s(107),s(110)],chronology=True)
    combo('t1-q10','Which policies illustrate total war in the home-front slide?',
      ['Governments nationalized industries to direct production.','Governments rationed consumer goods and sold war bonds.','Governments forbade strikes and used propaganda to maintain morale.'],
      'All three (A, B, and C)','Slide 81 connects government direction of industry, civilian supplies, finance, labor and information with the demands of total war.',[s(81)])
    replace('t1-q11','Approximately how far did Britain advance at the Somme, according to the battle-comparison slide?',
      'About five miles.',['About one mile.','About four miles.','About fifteen miles.','About twenty-five miles.'],
      'Slide 54 gives Britain’s gain as about five miles despite enormous casualties. The four-mile figure on the same slide refers to Germany’s advance at Verdun.',[s(54)])
    replace('t1-q13','Which sequence best explains Russia’s withdrawal as presented in the Eastern Front slide?',
      'Heavy wartime losses → unrest and revolution → the Treaty of Brest-Litovsk.',
      ['A decisive Russian victory → occupation of Germany → the Treaty of Versailles.','Western Front stalemate → British withdrawal → a Russian naval blockade.','The armistice with Germany → the Russian Revolution → renewed Russian entry into the war.'],
      'Slide 80 links heavy Russian losses to unrest, the 1917 revolution and the Treaty of Brest-Litovsk in 1918.',[s(80)])
    replace('t1-q14','Which three states do the imperialism slides identify as relatively late entrants into the colonial race?',
      'Germany, Italy and Japan.',['Britain, France and Russia.','Germany, Britain and France.','Italy, Russia and Britain.','Japan, France and Britain.'],
      'Slide 29 singles out Germany, Italy and Japan. Competition for colonies added tension to an international order already dominated by established empires.',[s(27,29)])
    replace('t1-q15','How do the armistice and the Paris negotiations differ in the slides?',
      'The November 1918 armistice stopped fighting; the 1919–1920 conference worked on the peace terms.',
      ['The armistice settled every permanent border; the conference only arranged the ceasefire.','The conference stopped fighting in 1914; the armistice imposed the final settlement in 1918.','The armistice created all postwar states; the conference had no remaining territorial questions.'],
      'Slide 110 identifies the official ceasefire on November 11, 1918. Slide 113 explains that a later treaty was needed to finalize peace terms.',[s(110),s(113)])
    cite('t1-q08',[s(50,52)])
    cite('t1-q09',[s(55,67)])

    replace('t2-q06','Which sequence correctly orders the declarations and entries shown for the opening crisis?',
      'Austria-Hungary declares war on Serbia → Germany declares war on Russia → Germany declares war on France → Britain enters',
      ['Germany declares war on Russia → Austria-Hungary declares war on Serbia → Germany declares war on France → Britain enters','Austria-Hungary declares war on Serbia → Germany declares war on France → Germany declares war on Russia → Britain enters','Austria-Hungary declares war on Serbia → Britain enters → Germany declares war on Russia → Germany declares war on France','Britain enters → Germany declares war on France → Austria-Hungary declares war on Serbia → Germany declares war on Russia'],
      'The sequence is July 28, August 1, August 3 and August 4, 1914. The slide’s timeline shows how quickly the regional conflict widened.',[s(36)],chronology=True)
    cite('t2-q08',[s(52),s(79)],'Allied forces regrouped and checked the German advance near Paris. The failure of a rapid western victory helped produce the trench stalemate described in the slides.')
    replace('t2-q09','Why did unrestricted submarine warfare create a problem for neutral shipping?',
      'Merchant vessels could be attacked without warning, putting neutral passengers and cargo at risk.',
      ['It required every merchant vessel to become an armed warship before crossing the Atlantic.','It protected neutral vessels while limiting attacks to enemy battleships.','It allowed neutral states to inspect submarines before an attack could occur.','It affected only military railways and left ocean trade outside the conflict.'],
      'The submarine-warfare map and Lusitania propaganda connect naval attacks to civilian and neutral interests. These attacks helped undermine American neutrality.',[s(105,107)])
    combo('t2-q10','Which statements correctly describe wartime information policies in the slides?',
      ['Censorship restricts the information that reaches an audience.','Propaganda tries to persuade people to believe or act in a particular way.','A persuasive poster by itself proves that its audience agreed with its message.'],
      'A and B only','The home-front and propaganda slides distinguish control of information from persuasion. A poster shows what its creator wants people to think, not necessarily what people actually thought.',[s(81,84)])
    replace('t2-q11','What approximate proportion of British troops on the Western Front does the trench-life slide say died?',
      '12 percent.',['2 percent.','5 percent.','25 percent.','50 percent.'],
      'Slide 69 gives approximately 12 percent. This is the slide’s estimate for British troops on the Western Front, not a percentage for every army or every kind of casualty.',[s(69)])
    replace('t2-q12','Why did the absence of antibiotics make the trench conditions in the slides especially dangerous?',
      'Infections could become severe in cold, damp and unsanitary conditions.',
      ['It prevented armies from distributing food rations to the front.','It made artillery fire more accurate against protected dugouts.','It removed the need for sanitation because infections could not spread.','It meant only mental injuries needed medical treatment.'],
      'Slide 69 places the lack of antibiotics alongside unsanitary water and poor trench conditions. Wounds and disease were harder to manage in that environment.',[s(69,73)])
    replace('t2-q13','What did France lose during German unification that contributed to later French-German tension?',
      'Alsace-Lorraine.',['Bosnia-Herzegovina.','Belgium and Luxembourg.','Serbia and Montenegro.','The German overseas colonies.'],
      'Slide 9 identifies Alsace-Lorraine and links French resentment to Germany’s concern about retaliation.',[s(9)])
    replace('t2-q14','Who are the “Nicky” and “Willy” discussed in the slides about the 1914 crisis?',
      'Russia’s Nicholas II and Germany’s Wilhelm II.',
      ['Russia’s Nicholas II and Austria-Hungary’s Franz Ferdinand.','Germany’s Wilhelm II and Britain’s George V.','Austria-Hungary’s Franz Ferdinand and Serbia’s Gavrilo Princip.','France’s president and Britain’s prime minister.'],
      'The photographs and telegram activity concern Nicholas II and Wilhelm II. Personal contact between rulers did not prevent the international crisis from escalating.',[s(38,40)])
    replace('t2-q15','Which statement matches the U.S. ratification outcome shown in the slides?',
      'The United States signed the treaty, but it was not ratified; the country did not join the League.',
      ['The United States ratified the treaty but refused to sign it.','The United States joined the League automatically when Wilson signed.','The United States rejected both signature and any later separate treaty.','The United States ratified the treaty only after France and Britain withdrew.'],
      'Slide 120 distinguishes signing from ratifying and refers to a separate treaty. Its missing-keystone cartoon highlights American absence from the League.',[s(120)])

    cite('t3-q05',[s(115)],'Wilson’s proposed association of nations became the League of Nations. The slide presents international cooperation as a way to prevent future wars.')
    replace('t3-q06','Put these battles and Russian developments in order from oldest to newest.',
      'Marne → Verdun → Russian Revolution → Brest-Litovsk',
      ['Verdun → Marne → Russian Revolution → Brest-Litovsk','Marne → Russian Revolution → Verdun → Brest-Litovsk','Marne → Verdun → Brest-Litovsk → Russian Revolution','Russian Revolution → Marne → Brest-Litovsk → Verdun'],
      'The Western Front slide dates the Marne to 1914 and Verdun to 1916. The Eastern Front slide dates the Russian Revolution to 1917 and Brest-Litovsk to 1918.',[s(79,80)],chronology=True)
    cite('t3-q07',[s(55,65)],'Barbed wire delayed attackers, while gas masks offered protection against poison gas. New weapons did not instantly remove the defensive advantages of trenches and firepower.')
    replace('t3-q08','What was the main purpose of communication trenches in the trench-system diagram?',
      'To connect positions so soldiers and supplies could move with some protection.',
      ['To provide an exposed lane for infantry to charge the opposing front line.','To replace the front line with a route intended only for civilian traffic.','To create gaps in the wire so enemy patrols could be observed at close range.','To make every trench position visible to distant artillery crews.'],
      'Communication trenches linked parts of the defensive system. Their function differed from no man’s land, which soldiers crossed while attacking the enemy.',[s(60)])
    replace('t3-q09','A soldier describes swollen, numb feet after prolonged exposure to waterlogged trenches. Which condition from the slides fits?',
      'Trench foot.',['Shell shock.','Poison-gas injury.','Lice infestation.','A shrapnel wound.'],
      'The account on slide 71 describes swelling, loss of feeling, intense pain and possible amputation. It shows the danger of prolonged wet trench conditions.',[s(69,71)])
    replace('t3-q10','Which combination does the armistice slide give as reasons for German surrender?',
      'Depleted resources, worsening conditions, internal unrest and military defeats.',
      ['Growing resources, political stability and a decisive victory in France.','The absence of civilian hardship combined with an exclusively naval victory for the Allies.','Russian reentry into the war after the League ordered Germany to stop fighting.','An agreed final peace treaty that had already resolved all German territorial claims.'],
      'Slide 110 presents surrender as the result of several pressures acting together. The armistice preceded the negotiation of final peace terms.',[s(110)])
    combo('t3-q11','Which comparisons between the fronts agree with the slide deck?',
      ['The failure of a quick victory in France helped produce a western stalemate.','The Western Front generally had more mobile warfare than the Eastern Front.','The Eastern Front’s heavy Russian losses contributed to unrest.'],
      'A and C only','Slides 52–53 describe the failed quick victory and western deadlock. Slides 79–80 contrast western trench warfare with more mobile eastern fighting and connect Russian losses to unrest.',[s(52,53),s(79,80)])
    replace('t3-q12','How did industrialization strengthen the militarism described in the slides?',
      'Factories could supply large armies with increasing quantities of weapons and equipment.',
      ['Factory production made armies independent of civilian resources and government finance.','Industrial growth removed competition over military capacity between rival states.','Mechanized production ended the need to mobilize soldiers or move supplies.','The growth of factories reduced the destructive power of weapons used in the war.'],
      'The industrialization slides connect productive capacity with the military competition described earlier. The fighting then exposed the destructive power of industrial weapons.',[s(6,7),s(30,31),s(49)])
    replace('t3-q13','In the home-front slide, what does nationalizing industry mean?',
      'Bringing industry under government ownership or control.',
      ['Selling loans to civilians to raise government funds.','Restricting the amount of consumer goods people may obtain.','Removing military information from published reports.','Encouraging patriotic enlistment through persuasive posters.'],
      'Nationalization concerns control of production. The other choices describe war bonds, rationing, censorship and recruiting propaganda—related but distinct wartime measures.',[s(81)])
    replace('t3-q14','Why does the impact-of-war slide say that not all injuries were visible?',
      'War could cause serious psychological trauma as well as physical wounds.',
      ['Shell shock was simply another name for every broken bone.','Surviving a battle meant a soldier no longer needed medical support.','Mental injuries affected only people who had never experienced fighting.','Damage was limited to buildings and did not affect returning soldiers.'],
      'Slide 111 connects shell shock with what is now discussed as post-traumatic stress. It emphasizes the difficulty of supporting both physical and mental injuries.',[s(111)])
    replace('t3-q15','What distinction does the U.S. export chart invite students to make about neutrality before 1917?',
      'Remaining formally outside the war did not mean trading equally with both coalitions.',
      ['Formal neutrality required the United States to stop every overseas export.','Trading with an Allied state automatically constituted a U.S. declaration of war.','The size of export sales alone proves why every American supported one side.','A neutral country’s trading pattern must be identical to its military commitments.'],
      'Slide 109 asks whether the United States was really neutral. The chart shows unequal economic ties, while slide 107 dates formal U.S. entry to April 1917.',[s(107),s(109)])

    cite('t4-q03',[s(120)],'The missing keystone represents weakness caused by the absence of the United States, a major power whose president had helped design the League.')
    replace('t4-q05','What motivation is most clearly shown by the foreign powers gathered around the Chinese “pie”?',
      'Competition for territory, markets and influence in China.',
      ['A shared plan to withdraw all foreign influence from China.','Support for Chinese control over every foreign concession.','An effort to unify the European states into one national government.'],
      'The image treats China as something foreign powers can divide. It illustrates imperial competition, the theme of the slides in which it appears.',[s(27,29)])
    replace('t4-q06','Which sequence moves from the outbreak of war to the peace negotiations in the correct order?',
      'War begins → United States enters → armistice → Paris Peace Conference',
      ['United States enters → war begins → armistice → Paris Peace Conference','War begins → armistice → United States enters → Paris Peace Conference','War begins → United States enters → Paris Peace Conference → armistice','Paris Peace Conference → war begins → armistice → United States enters'],
      'The war began in 1914; the United States entered in April 1917; the armistice took effect in November 1918; the slides date the Paris conference to 1919–1920.',[s(34,36),s(107),s(110),s(113)],chronology=True)
    combo('t4-q07','Which ideas are identified as core principles of Wilson’s Fourteen Points in the slides?',
      ['Self-determination for nations.','An international organization to help preserve peace.','Punishing Germany as the sole purpose of the peace settlement.'],
      'A and B only','Slide 115 names self-determination and the League of Nations. It contrasts Wilson’s goal with demands for punitive measures against Germany.',[s(115)])
    cite('t4-q08',[s(21,22),s(117,119)])
    replace('t4-q09','What happened to parts of the former Ottoman Empire under the mandate arrangements in the slides?',
      'They were administered by outside powers under a League framework rather than becoming immediately independent.',
      ['They all became fully independent states without any outside supervision.','They remained Ottoman provinces with unchanged rulers and boundaries.','They became equal constituent states of a single European federation.','They were governed by the United States after it joined the League.'],
      'Slide 119 describes new Middle Eastern mandates carved from the former Ottoman Empire and questions why these territories were not given independence like new European nations.',[s(119)])
    combo('t4-q10','Which statements follow from the postwar maps and mandate discussion?',
      ['The European map shows the creation or enlargement of several states.','Many African, Asian and Middle Eastern territories remained under outside control.','Self-determination was applied identically to every European and colonial population.'],
      'A and B only','The comparison between European border changes and the mandate system exposes unequal applications of self-determination. The slides explicitly ask why colonial territories were treated differently.',[s(117,119)])
    replace('t4-q11','Which pairing correctly locates the two major European fronts?',
      'Western Front: Belgium and France; Eastern Front: Central and Eastern Europe.',
      ['Western Front: Russia and East Prussia; Eastern Front: Belgium and France.','Western Front: Britain and Ireland; Eastern Front: Spain and Portugal.','Western Front: the Atlantic sea lanes; Eastern Front: the Mediterranean sea lanes.','Western Front: Serbia alone; Eastern Front: northern France alone.'],
      'Slides 79 and 80 explicitly identify these locations. Geography helps explain the contrast between a continuous western trench front and more mobile warfare in the east.',[s(79,80)])
    replace('t4-q12','A poster says “Back Him Up” and promotes Victory Bonds. What action is it primarily trying to motivate?',
      'Lending savings to the government to finance the war.',
      ['Enlisting directly into a front-line infantry unit.','Accepting a reduced household food ration.','Withholding news about troop movements from newspapers.','Volunteering for a specific battlefield medical unit.'],
      'The Victory Bonds poster asks civilians to provide financial support. Slide 81 identifies selling war bonds as a way for governments to raise capital.',[s(81),s(85)])
    replace('t4-q13','What does comparing the ethnic map with the political map help explain about multiethnic empires?',
      'National communities and state boundaries did not always match.',
      ['Every political border enclosed a population with one shared national identity.','National identification depended only on the size of a state’s army.','Every minority group already possessed an independent government.','Language differences had no connection to demands for political change.'],
      'Slides 21–22 ask how nationalism threatened empires containing different peoples. A community’s national claims could challenge the existing state boundary.',[s(21,22)])
    replace('t4-q14','Why did German naval growth concern Britain in the prewar alliance discussion?',
      'It challenged British naval power and altered the European balance of power.',
      ['It placed Britain and Germany under the same military command.','It ended Germany’s rivalry with France over Alsace-Lorraine.','It made Britain independent of its overseas trade routes.','It guaranteed that Britain could remain neutral in every continental crisis.'],
      'Slides 7 and 10 link German naval expansion to British concern and diplomatic alignment with France and Russia.',[s(7),s(10)])
    cite('t4-q15',[s(121)],'The phrase “a peace built on quicksand” highlights dissatisfaction and weak foundations. It invites an explanation of instability without proving that every later event was inevitable.')

    replace('t5-q06','Which order correctly connects a prewar alliance to the assassination and two later U.S.-related developments?',
      'Franco-Russian alliance → Sarajevo assassination → Lusitania sinking → Zimmermann Telegram',
      ['Sarajevo assassination → Franco-Russian alliance → Lusitania sinking → Zimmermann Telegram','Franco-Russian alliance → Lusitania sinking → Sarajevo assassination → Zimmermann Telegram','Franco-Russian alliance → Sarajevo assassination → Zimmermann Telegram → Lusitania sinking','Zimmermann Telegram → Franco-Russian alliance → Sarajevo assassination → Lusitania sinking'],
      'The slides place the Franco-Russian military alliance in 1892, the assassination in June 1914, the Lusitania sinking in 1915, and the decoded Zimmermann Telegram in January 1917.',[s(10),s(34),s(102),s(106)],chronology=True)
    cite('t5-q08',[s(94,96),s(112)],'The world-empires map and the statistics for imperial powers show that the war drew on people and territories beyond Europe. Formal military fronts alone do not capture its global reach.')
    cite('t5-q11',[s(54),s(112)],'The battle comparison uses casualty figures, while the final statistics slide reports deaths. Casualties can include wounded, missing and captured people as well as those killed.')
    replace('t5-q12','Which contrast best illustrates the uneven application of self-determination emphasized in the slides?',
      'New states appeared in Europe while former Ottoman territories became mandates under outside administration.',
      ['All European states became mandates while every overseas colony gained immediate independence.','Europe’s borders remained unchanged while all former empires became one federal state.','The same independence settlement applied automatically to every national group in every region.','The League removed all outside influence from mandated territories before they were administered.'],
      'Slides 117–119 compare redrawn European borders with Middle Eastern mandates. The contrast is central to the slide’s question about why non-European territories were not treated in the same way.',[s(117,119)])
    cite('t5-q13',[s(117,121)])
    replace('t5-q14','The statistics slide lists about 42 million Allied troops and 23 million Central Powers troops mobilized. Which comparison is closest?',
      'The Allies mobilized nearly twice as many troops.',
      ['The coalitions mobilized approximately equal numbers.','The Allies mobilized about half as many troops.','The Allies mobilized roughly three times as many troops.','The Allies mobilized roughly four times as many troops.'],
      '42 divided by 23 is approximately 1.8. These are coalition totals; the comparison does not by itself establish which individual state had the largest army.',[s(112)])
    replace('t5-q15','How should a student use the contrast between recruiting propaganda and soldiers’ trench accounts?',
      'Compare the image of service promoted to recruits with the conditions soldiers described.',
      ['Treat the recruiting message as a complete record of everyday trench conditions.','Assume one soldier’s account precisely describes every soldier’s experience throughout the war.','Use the poster’s intended message as proof that every viewer agreed with it.','Ignore source purpose because photographs, posters and memoirs always make identical claims.'],
      'The deck juxtaposes persuasion and lived experience. Comparing purpose, message and testimony helps explain the gap between romantic expectations and the realities of industrial war.',[s(69,78),s(83,92)])

    for t in tests:
        t['revisedQuestionIds']=[q['id'] for q in t['questions'] if q['id'] in revised]
        for q in t['questions']:
            if q['type']=='mc':
                q['sources']=[source for source in q['sources'] if source['kind']=='slides']
                assert q['sources'],q['id']
                assert all(source['last']<=121 for source in q['sources']),q['id']
