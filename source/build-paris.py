import json
from pathlib import Path
people=[]
def p(name,leader,pages,tag,goal,motives,tension,outcome,note=None):
 people.append(dict(name=name,leader=leader,pages=pages,tag=tag,goal=goal,motives=motives,tension=tension,outcome=outcome,note=note))
p('Britain','David Lloyd George',[1],'Big Four','Protect the British Empire and European security while restoring trade.',[
'Preserve imperial holdings, trade routes, and Britain’s international influence. Indian self-rule was not part of the British delegation’s agenda.',
'Secure France, remove the German naval threat, settle territorial disputes, and support a League of Nations.',
'Demand reparations to address wartime losses, but rehabilitate Germany sufficiently to stabilize Europe and revive its role as a buyer of British goods.'
],'Punishing Germany too severely could undermine the German recovery Britain needed for trade. Public demands for compensation also limited compromise.','The handout presents Britain as balancing French security demands with the need for a functioning European economy.')
p('France','Georges Clemenceau',[2],'Big Four','Prevent another German invasion and obtain compensation for devastation.',[
'Weaken Germany militarily, strategically, and economically after repeated invasions of French territory.',
'Seek British and American guarantees of French security and compensation for deaths, destruction, lost production, and damaged land.',
'Prioritize practical security over confidence that Wilson’s international principles alone could prevent future attacks.'
],'France wanted a much weaker Germany; Wilson and British leaders feared that an excessively punitive settlement could destabilize Europe.','The handout also describes René Massigli’s attempts at rapprochement with Germany, showing that French policy included diplomatic alternatives. The U.S. Senate did not ratify the proposed American security guarantee.')
p('Italy','Vittorio Orlando',[3],'Big Four','Obtain the territorial rewards promised for entering the war on the Allied side.',[
'Invoke the secret Treaty of London (1915), through which Britain and France promised territorial gains in return for Italian participation.',
'Use Italy’s heavy casualties and financial losses to argue that sacrifice deserved compensation and great-power status.',
'Press claims to former Austro-Hungarian territories and wider imperial gains.'
],'Italian claims conflicted with other national claims, Wilsonian self-determination, and Allied concern about Italian expansion.','Orlando temporarily left the conference in protest. Italy gained territory but did not receive everything its leaders sought; disappointment encouraged a sense of an incomplete victory.',
'The handout’s list of colonial rewards is oversimplified. Focus on the Treaty of London promises, competing claims, and Italy’s dissatisfaction rather than memorizing its claim that Italy received “a couple of small German colonies.”')
p('United States','Woodrow Wilson',[4,5],'Big Four','Create a durable peace through self-determination, diplomacy, and a League of Nations.',[
'Use the Fourteen Points as a basis for a more open international order, with national sovereignty and cooperation instead of recurring war.',
'Favor a less punitive treatment of Germany than France sought, while negotiating compromises to secure the League.',
'Raise questions about the wishes of people in former Ottoman territories and the conflict between national aspirations and imperial claims.'
],'Wilson’s principles conflicted with Allied security and colonial interests. At home, opponents resisted commitments that might limit U.S. freedom of action.','The League was established, but the U.S. Senate rejected ratification of Versailles. The United States never joined the League and signed separate peace treaties in 1921.',
'The handout overstates U.S. rejection of Article 231: Wilson ultimately accepted the treaty containing it. Separate Wilson’s preferred principles from the compromises he actually signed.')
p('Japan','Saionji Kinmochi & Makino Nobuaki',[6],'Recognition & territory','Gain recognition as an equal great power and retain former German interests in Asia and the Pacific.',[
'Obtain German rights in Shandong, including the Kiaochow/Jiaozhou concession, and former German islands north of the equator.',
'Rely on wartime occupation and secret Allied agreements to support territorial claims against China’s objections.',
'Add a racial-equality provision to the League Covenant to improve international recognition and equal treatment of member-state nationals.'
],'Japan’s Shandong demand conflicted with Chinese sovereignty. Its equality proposal met resistance linked to immigration exclusion, especially from Australia.','Japan secured important territorial gains, while its racial-equality proposal was rejected. The contrast contributed to resentment toward the Western powers.',
'Japan signed the Treaty of Versailles and joined the League. Do not treat the handout’s “walked out” wording as a claim that Japan abandoned the final settlement.')
p('China','Lu Cheng-hsiang & V. K. Wellington Koo',[7],'Sovereignty','Recover Shandong and reduce foreign control within China.',[
'Demand the return of German rights in Shandong to China rather than their transfer to Japan.',
'Challenge foreign privileges such as extraterritoriality, foreign guards, and leased territories.',
'Invoke Wilson’s self-determination and international equality despite China’s internal division between rival governments.'
],'Japan’s wartime agreements and great-power bargaining outweighed China’s appeal to sovereignty. Chinese delegates also faced distrust and pressure at home.','The Shandong decision helped trigger the May Fourth Movement. China refused to sign Versailles. The slide deck later contrasts the 1919 decision with the restoration of Chinese sovereignty in Shandong in 1922.')
p('Australia','Billy Hughes',[8,9],'Empire & security','Obtain reparations and control of German New Guinea while preserving the White Australia policy.',[
'Use Australia’s high losses, including the experience of Gallipoli and the ANZACs, to justify compensation and a strong voice in the settlement.',
'Expand control in the nearby Pacific, especially former German New Guinea, as a matter of security and influence.',
'Oppose Japan’s racial-equality proposal to defend racially exclusionary immigration policy, lobbying Britain in support.'
],'Australia’s racial and territorial priorities conflicted with Japan’s equality proposal and with Wilson’s objections to annexation.','Australia received a Class C mandate over former German New Guinea. Its position illustrates how an imperial dominion could seek its own territorial influence while relying on Britain.')
p('Romania','Queen Marie',[10],'Territory & recognition','Secure favorable treatment, promised territorial gains, and recognition of Romania’s wartime claims.',[
'Press the case that Romania’s participation and sacrifices entitled it to the rewards promised in its 1916 agreement with the Entente.',
'Counter Allied distrust created by Romania’s wartime reversals and separate peace under severe military pressure.',
'Use Queen Marie’s personal diplomacy to gain sympathy and support from the major powers.'
],'Romania wanted promised gains, while the Allies questioned the consequences of its wartime decisions and disputed parts of its demands.','Queen Marie helped advocate Romania’s case; disputes over terms and reparations remained.',
'Historical correction: Romania was already independent before WWI, and the postwar settlement greatly enlarged it, including recognition of Transylvania. The handout’s claim that it “never got the land” is misleading. Its most useful theme is the struggle to secure claims and favorable recognition.')
p('Vietnam','Nguyễn Ái Quốc (later known as Ho Chi Minh)',[11],'Rights under colonial rule','Win civil rights, legal equality, and Vietnamese representation within French colonial rule.',[
'Seek amnesty for political prisoners and equal judicial treatment for Vietnamese people and Europeans.',
'Demand freedoms of speech, press, association, assembly, travel, and education, including technical schools.',
'Replace arbitrary rule with the rule of law and create elected Vietnamese representation in the French parliament.'
],'French imperial interests and the conference’s priorities limited attention to even these moderate demands.','The eight-point petition received no meaningful response from the peacemakers but increased the petitioner’s visibility among Vietnamese activists.',
'The 1919 petition did not demand immediate full independence. Distinguish these specific reforms from Ho Chi Minh’s later independence movement.')
p('South Africa','Jan Smuts',[12],'Reconciliation & empire','Reconcile with Germany while retaining reparations, imperial influence, and a South African voice.',[
'Support Wilson’s “peace without victory,” the Fourteen Points, and the League of Nations.',
'Hold Germany responsible for monetary damages while opposing a settlement that ruled out reconciliation.',
'Support the mandate system for former German colonies and increase South Africa’s influence in international decisions.'
],'Smuts supported international cooperation but worried about U.S. power. His support for some national claims did not extend to racial equality for Black South Africans.','His position shows that support for the League and reconciliation could coexist with imperial ambitions and racial exclusion.')
p('India','Official Indian delegation; Montagu & Singh in the handout',[13],'Representation without independence','Secure a recognized international role; Indian nationalists also sought genuine self-government.',[
'India’s official delegates signed the peace treaties and supported the League and Wilsonian principles while India remained under British rule.',
'Wartime service strengthened arguments that Indians deserved political rights and self-determination.',
'Nationalist demands, associated in the handout with Gandhi and the Indian National Congress, challenged continued British control and their exclusion from effective representation.'
],'Official representation did not mean independence or representation of all Indian political opinion. British imperial interests limited how self-determination was applied.','India joined the League despite lacking self-government. The 1919 Amritsar massacre and continued repression sharpened anger toward British rule.',
'The Indian National Congress was founded in 1885; it was not newly created at the time of the conference. Keep the official colonial delegation distinct from nationalist demands.')
p('Ottoman lands / Turkish nationalists','Mustafa Kemal (later Atatürk)',[14],'Sovereignty','Resist foreign partition and secure a sovereign Turkish state.',[
'Draw on military leadership, including defense of the Gallipoli front, to argue for national dignity and the ability to govern without outside domination.',
'Reject weak leadership and foreign occupation or partition of Turkish lands.',
'Challenge European prejudice and the assumption that defeated Ottoman peoples should simply accept decisions made by the victors.'
],'Allied territorial plans conflicted with Turkish nationalist claims and resistance on the ground.','The handout follows the story beyond Paris: the Turkish independence struggle led to a revised settlement at Lausanne in 1923 and the creation of modern Turkey.',
'This sheet presents a Turkish nationalist perspective for the simulation. Mustafa Kemal was not a member of the Paris negotiating delegation; later events should not be confused with decisions he personally made at the conference.')
p('Arab claims / Middle East','Prince Faisal, supported by T. E. Lawrence',[15],'Independence','Obtain Arab independence promised in connection with revolt against Ottoman rule.',[
'Argue that Arab wartime assistance against the Ottomans should be rewarded with self-rule.',
'Resist the division of former Ottoman Arab territories into British and French spheres and mandates.',
'Appeal to Wilsonian self-determination and seek recognition of Arab leadership and national aspirations.'
],'British and French wartime promises and secret agreements conflicted with Arab expectations; claims in Palestine also overlapped with Zionist goals.','British and French influence predominated in the mandate settlement. The later placement of Faisal in Iraq and Abdullah in Transjordan did not fulfill broad expectations of independent Arab rule.',
'Lawrence was a British advocate of Arab claims, not the representative of every Arab community. The later monarchies belong to the post-conference chronology.')
p('Zionist movement','Chaim Weizmann',[16,21],'National home','Secure international support for a Jewish national home in Palestine.',[
'Ask for a British-administered mandate that would facilitate Jewish immigration and settlement.',
'Promote self-government and religious freedom while invoking historical ties and the need for refuge from European antisemitism.',
'Build on British support expressed in the Balfour Declaration.'
],'Zionist national aspirations overlapped with Arab and Palestinian claims to self-determination in the same territory. The handout’s role-play rhetoric reflects one assigned viewpoint, not a neutral account of those claims.','The mandate framework advanced the national-home project; the handout also looks ahead to Israel’s establishment in 1948 and Palestinian displacement.',
'Historical correction: the Balfour Declaration was issued in 1917, not 1916. It supported a “national home for the Jewish people,” not an explicit immediate sovereign state, and also referred to the civil and religious rights of existing non-Jewish communities. Pages 16 and 21 repeat this perspective.')
p('Pan-Africanists','Blaise Diagne & the Pan-African Congress',[17],'Rights & protection','Win international protections against colonial abuse and a path toward African participation in government.',[
'Bring together representatives and supporters from Africa, the Caribbean, and North America to challenge discrimination and oppression.',
'Call for an international code protecting African peoples and their rights.',
'Advocate eventual participation in self-government; the specific 1919 resolution described here stopped short of demanding immediate full independence.'
],'Even moderate demands challenged the racial hierarchy of colonial rule. The powers that promoted some European national claims remained reluctant to extend the same principles overseas.','The conference powers made no firm commitment to these demands. Pan-African organizing nevertheless created a forum for shared political advocacy.',
'Historical correction: Blaise Diagne was Senegalese, not Haitian as the sheet labels him. The later Négritude movement should not be treated as an already established 1919 movement.')
p('Brazil','Epitácio Pessoa',[18],'Economic recovery','Protect economic interests and strengthen relations with the United States.',[
'Seek a place in postwar bargaining after joining the war in 1917 amid German attacks on Brazilian merchant shipping.',
'Protect trade and industrial gains made while European economies were occupied with war.',
'Secure access to U.S. finance and support as renewed European competition threatened Brazil’s economy.'
],'The handout contrasts public appeals to liberty and peace with economic incentives and elite interests. That is the author’s interpretation of motives, not a direct statement of every Brazilian participant’s views.','Pessoa supported U.S. aims, reflecting the importance of American economic and diplomatic ties to Brazil’s postwar strategy.')
p('Korea','Kim Gyu-sik and other unofficial representatives',[19,20],'Independence','End Japanese colonial rule and gain recognition as an independent state.',[
'Invoke Wilson’s self-determination to demand Korean liberation and international recognition.',
'Present the suppression of the March First Movement, censorship, and economic exploitation as evidence against continued Japanese rule.',
'Seek a hearing through unofficial representatives when an official Korean delegation could not participate.'
],'Korean claims challenged the authority of Japan, an Allied power. The gap between great-power rhetoric and actual support for colonized peoples limited the petition’s influence.','The representatives achieved little at Paris. Their experience became an example of the uneven application of self-determination.')
comparisons=[
['Germany’s future','France: weaken Germany for security. Britain: compensation plus commercial recovery. U.S. and Smuts: reconciliation and international cooperation.'],
['Shandong','China: restore Chinese sovereignty. Japan: retain German rights based on wartime gains and agreements.'],
['Racial equality','Japan: an equality clause in the League Covenant. Australia: defend exclusionary immigration policy; Smuts also maintained racial exclusion at home.'],
['Former Ottoman lands','Arab claimants: independence. Zionist movement: a Jewish national home in Palestine. Britain and France: mandates and influence. Turkish nationalists: resist partition.'],
['The reach of self-determination','Korea sought independence; Vietnam’s 1919 petition sought civil reforms; Pan-Africanists sought legal protection and future participation; Indian nationalists sought self-government. These were related but distinct demands.'],
['Promises and rewards','Italy and Romania invoked wartime agreements and sacrifice. Brazil emphasized economic interests and U.S. ties. Australia sought compensation and Pacific control.']]
Path('/workspace/sites/wwi-study-guide/dist/paris.json').write_text(json.dumps({'perspectives':people,'comparisons':comparisons},ensure_ascii=False,indent=2))
print(f'Saved {len(people)} distinct country and movement perspectives.')
