import json
from pathlib import Path
p=Path('/workspace/sites/wwi-study-guide/dist/assets/page-index.json');data=json.loads(p.read_text())
titles='''Causes of World War I — title
What caused World War I?
MANIA: causes and trigger
MAIN: long-term causes
Militarism — section title
Militarism: definition
Military competition and spending
Alliances — section title
German unification and Alsace-Lorraine
The Triple Entente
The Triple Alliance
The alliance balance — diagram
Interconnected alliances — diagram
The main powers and Italy’s switch
European alliances in 1914 — map
Alliances and escalation — cartoon
“If you hit him…” — cartoon
The domino effect
Nationalism — section title
Nationalism — cartoons
Nationalism and multiethnic empires
Ethnic map versus political map
Locating the Balkans in Europe
The Balkan Peninsula — map
Serbia, Bosnia, and Austria-Hungary
The “powder keg” of Europe
Imperialism — section title
Imperialism and competing powers
World empires around 1900
Another “I”: industrialization
Factories and industrialization
Assassination — section title
Franz Ferdinand and Gavrilo Princip
The Sarajevo assassination
“Did a wrong turn start WWI?” — video still
Declarations of war — timeline
Counterfactual debate: would war have happened?
“Nicky” and “Willy” — photograph
Nicholas II and Wilhelm II
Telegram conversation activity
Blank slide
“Germany declares war” — newspaper
Review: long-term causes
MANIA review
Review: nationalism and the outbreak
“The Crime of the Ages—Who Did It?” — cartoon
Romanticism versus reality — title
European powers during the war — map
“Over by Christmas”
The Schlieffen Plan
WWI in Europe — campaign map
The quick victory fails
Western Front trench warfare
Verdun and the Somme
The new weapons of war
What is a trench?
Trench warfare — video still
Trench warfare — video still
Aerial view of trenches
Anatomy of a trench system
Life in a trench — photograph
Gas masks and a machine gun
Infantry leaving a trench
Attack across open ground
Barbed wire and no man’s land
Soldiers under fire — film still
All Quiet on the Western Front — clip prompt
Horrors of the trenches — title
Death, sanitation, and medical limits
Trench rats — soldier accounts
Trench foot — soldier account
Other creatures in the trenches
Lice — soldier account
Blank slide
Propaganda versus reality
British recruiting office — photograph
British enlistment, 1914
Nationalism in All Quiet — clip prompt
The Western Front
The Eastern Front
Total war and the home front
What is propaganda? — prompt
Propaganda: purposes and examples
Labels, symbols, exaggeration, and message
“Back Him Up” — Victory Bonds
“Britons … wants YOU”
“Daddy, what did YOU do?”
“Step into Your Place”
“Women of Britain Say—GO!”
“Destroy This Mad Brute”
“I Want You for U.S. Army”
“Wake Up, America!”
Blank slide
How was WWI a global conflict?
Empires and self-determination — world map
WWI in Europe — map
They Shall Not Grow Old — clip prompt
Blank slide
War ends and the peace conference — title
Decode a secret telegram — classroom activity
Telegram decoding exercise
Zimmermann Telegram — original decoded message
The Zimmermann Telegram — explanation
Territory offered to Mexico — map
Unrestricted submarine warfare — map
“Remember the Lusitania” — propaganda
U.S. entry: April 6, 1917
“War is declared by U.S.” — newspaper
Was the U.S. economically neutral? — export chart
The armistice and German surrender
The impact of modern warfare
Mobilization and deaths — statistics
After the armistice: negotiating peace
Differing perspectives on peace
Wilson’s Fourteen Points
Treaty of Versailles — video still
Europe before World War I — map
Europe after World War I — map
Middle Eastern mandates
U.S. ratification and the League
“A peace built on quicksand”
Paris Peace Conference simulation
B Track — simulation assignments
D Track — simulation assignments
F Track — simulation assignments
G Track — simulation assignments
Classroom research and simulation directions'''.splitlines()
assert len(titles)==127,len(titles)
docs=['British perspective','French approach','Italian approach','American approach','American approach — resources','Japanese approach','Chinese perspective','Australian perspective','Australian perspective — continuation','Romania: Queen Marie','Ho Chi Minh — Vietnam','Jan Smuts — South Africa','Indian delegation','Ottoman / Turkish perspective','Middle East: T. E. Lawrence','Zionist perspective','Blaise Diagne — Pan-Africanists','Brazil: Epitácio Pessoa','Korean perspective','Korean perspective — resources','Zionist perspective — repeated sheet']
for x in data:x['title']=(titles if x['section']=='slides' else docs)[x['number']-1]
p.write_text(json.dumps(data,ensure_ascii=False))
print('Labeled all 148 original pages.')
