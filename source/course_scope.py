"""Class scope: omit postwar Soviet history from authored notes and assessments."""
import json
import re
EXCLUDED = re.compile(r'Russian Civil War|civil-war|civil war|Soviet Union|Soviet Socialist|\bUSSR\b|\bNEP\b|New Economic Policy|Stalin|Trotsky|Lenin dies', re.I)
def excluded(value):
    return bool(EXCLUDED.search(json.dumps(value,ensure_ascii=False).replace('American Civil War','American conflict')))
def filter_readings(readings):
    r=next(r for r in readings if r['id']==3)
    r['blocks']=[b for b in r['blocks'] if not excluded(b)]
    r['keyTerms']={k:v for k,v in r['keyTerms'].items() if not excluded([k,v])}
    r['connections']=[c for c in r['connections'] if not excluded(c)]
    r['notes']=[n for n in r['notes'] if not excluded(n)]
    r['notes'].append('Wilson requested a declaration of war on April 2, 1917; Congress declared war on April 6.') if not any('April 2' in n for n in r['notes']) else None
    for p in r.get('pages',[]):
        if p['number']==3:p['label']='Textbook page 774 · Peace treaties'
        if p['number']==4:p['label']='Textbook page 775 · An ephemeral peace'
    return readings

def replacement_questions():
    def fill(stem,answer,variants,explanation,first,last):
        return dict(type='fill',section='blanks',stem=stem,answer=answer,accepted=[answer]+variants,explanation=explanation,sources=[dict(kind='slides',first=first,last=last)])
    replacements={
      't1-q21':fill('The American president who proposed the Fourteen Points was Woodrow _____.','Wilson',['Woodrow Wilson'],'Wilson proposed a peace program that included international cooperation through a League of Nations.',113,115),
      't3-q17':fill('The 1917 German policy of attacking shipping without warning was called _____ submarine warfare.','unrestricted',['unrestricted submarine warfare'],'Unrestricted submarine warfare threatened shipping and helped bring the United States into the war.',99,109),
      't3-q18':fill('The movement of people and resources into readiness for war is called _____.','mobilization',['mobilisation'],'Mobilization prepared armed forces for conflict and contributed to escalation in the July Crisis.',29,46),
      't3-q19':fill('The country Germany invaded on its route into France, prompting British entry, was _____.','Belgium',[],'The invasion of Belgium expanded the conflict and prompted Britain to enter the war.',29,46),
      't3-q20':fill('The international organization Wilson proposed to help prevent future wars was the _____.','League of Nations',['the League of Nations'],'The League was intended to preserve peace through cooperation and the resolution of disputes.',115,120)
    }
    replacements['t3-q24']=dict(type='short',section='short',stem='How did unrestricted submarine warfare and the Zimmermann Telegram contribute to American entry into World War I?',model='Unrestricted submarine warfare threatened merchant shipping and American lives, making neutrality more difficult to maintain. Germany hoped attacks on shipping would weaken Britain, but the policy also increased conflict with the United States. The Zimmermann Telegram proposed cooperation between Germany and Mexico if the United States entered the war, making German policy appear threatening closer to home. Together, these developments strengthened arguments for intervention. They should be understood alongside broader American economic and political ties to the Allies. The United States declared war on Germany in April 1917; its entry followed an accumulation of tensions rather than a single isolated incident.',rubric=['Explain the threat posed by unrestricted submarine warfare.','Identify the proposed German alliance with Mexico.','Connect both developments to the weakening of American neutrality.','Place U.S. entry in April 1917 and avoid reducing it to one isolated cause.'],sources=[dict(kind='slides',first=99,last=109)])
    return replacements

def filter_tests(tests):
    replacements=replacement_questions()
    for t in tests:
        t['questions']=[dict(replacements[q['id']],id=q['id']+'-wwi') if q['id'] in replacements else q for q in t['questions']]
        assert not any(excluded(q) for q in t['questions'])
    return tests
