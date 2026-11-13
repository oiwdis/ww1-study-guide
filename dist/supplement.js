const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
let content, query = '', group = 'all';

export async function initSupplement() {
  const response = await fetch('extra-information.json');
  if (!response.ok) throw new Error('Could not load extra-information.json');
  content = await response.json();
  $('#panel-extra').addEventListener('input', event => {
    if (event.target.id !== 'extra-search') return;
    query = event.target.value;
    renderCards();
  });
  $('#panel-extra').addEventListener('click', event => {
    if (!event.target.closest('[data-expand-extra]')) return;
    const cards = [...$('#extra-source-list').querySelectorAll('.supplement-card')];
    const open = cards.some(card => !card.open);
    cards.forEach(card => { card.open = open; });
    event.target.closest('button').textContent = open ? 'Collapse sources' : 'Expand sources';
  });
  const byId = id => content.sources.find(source => source.id === id);
  return [
    {
      id: 'extra-telegrams', title: 'The royal cousins & the Willy–Nicky telegrams',
      intro: 'Nicholas II and Wilhelm II: personal appeals, conflicting demands, and mobilization, July 29–August 1, 1914.',
      blocks: [
        { title: 'Identify the rulers', text: 'Nicky is Nicholas II of Russia; Willy is Wilhelm II of Germany. George V of Britain appears in the background sheet but does not participate in the ten telegrams. Family ties did not override state interests.' },
        ...byId('willy-nicky').blocks
      ],
      takeaway: byId('willy-nicky').takeaway,
      note: 'These are study paraphrases of the printed handout. The Extra Information tab includes all ten telegrams in sequence. Handwriting is excluded.',
      extraSources: [{ label: 'Background & ten telegrams', href: '#extra/telegrams' }]
    },
    {
      id: 'extra-trench-accounts', title: 'Two perspectives on the Western Front',
      intro: 'Clapham’s British memoir and Remarque’s novel connect trench warfare to its human and psychological costs.',
      blocks: [
        { title: 'Clapham: capture, consolidate, endure', text: 'In the account dated June 19, 1915, British troops capture German trenches, repair defenses, and hold on through bombardment and gas. Retreats and reoccupation show local movement, not a decisive breakthrough. Waiting helplessly, heat, crowding, and difficulty helping casualties produce intense psychological strain.' },
        { title: 'Remarque: survival and dehumanization', text: 'A fictional young German narrator describes bombardment, withdrawal, counterattack, and a return to his own position. Fear and survival displace heroic ideals. Ordinary empathy and self-control erode during combat; after exhaustion and rest, human awareness begins to return.' },
        { title: 'What the accounts share', text: 'Artillery and machine guns make exposed movement dangerous while damaging even defensive shelters. Both accounts connect industrial weapons with fear, exhaustion, and emotional numbing. Stalemate could include fierce local attacks and counterattacks with little decisive strategic change.' },
        { title: 'Use the right source label', text: 'Mud and Khaki is a retrospective memoir published in 1930. All Quiet on the Western Front is a 1929 novel informed by wartime experience. Compare their perspectives and themes, but do not treat fictional narration as an eyewitness record of the author’s exact actions.' }
      ],
      takeaway: 'Explain both the physical and psychological costs of trench warfare, using concrete details and distinguishing memoir from novel.',
      extraSources: [
        { label: 'Clapham’s memoir', href: '#extra/accounts/clapham' },
        { label: 'Remarque’s novel', href: '#extra/accounts/remarque' }
      ]
    },
    {
      id: 'extra-how-war-started', title: 'Crash Course 209: how the war began',
      intro: 'Trace the decisions from Sarajevo to British entry; distinguish a sequence of events from an explanation of causes.',
      blocks: [
        { title: 'June–July: a regional crisis', text: 'June 28: Franz Ferdinand is assassinated. July 5–6: Germany gives Austria-Hungary its blank check. July 23: Austria issues an ultimatum to Serbia. July 25–26: Serbia responds, accepting many but not all demands, and Russia begins preliminary preparations. July 28: Austria-Hungary declares war on Serbia.' },
        { title: 'July–August: escalation', text: 'July 30: Russia orders general mobilization. August 1: Germany declares war on Russia; Germany and France mobilize. August 3: Germany declares war on France. August 4: German troops invade Belgium and Britain declares war on Germany. Distinguish preliminary preparation from general mobilization and mobilization from a declaration of war.' },
        { title: 'Where the telegrams fit', text: 'The July 29–August 1 messages overlap with the shift from the Austro-Serbian war to Russian and German mobilization. The rulers’ conflicting accounts of defensive necessity show how diplomacy and military preparations proceeded together.' },
        { title: 'A sequence is not inevitability', text: 'Earlier Balkan conflicts had remained limited. The episode emphasizes decisions and uncertainty: people in July 1914 did not know the future. Asking how traces the chain; asking why evaluates the conditions and choices that made the outcome possible.' }
      ],
      takeaway: byId('crash-course-209').takeaway,
      extraSources: [{ label: 'Episode 209 notes & chronology', href: '#extra/videos/crash-course-209' }]
    },
    {
      id: 'extra-war-responsibility', title: 'Crash Course 210: who was responsible?',
      intro: 'Compare decisions by Austria-Hungary, Germany, and Russia; assess arguments using evidence rather than national stereotypes.',
      blocks: [
        { title: 'Austria-Hungary and Germany', text: 'Austria-Hungary chose the ultimatum and war against Serbia. Germany’s support encouraged Austrian risk-taking; its declarations of war and invasion of Belgium expanded the conflict. These choices support arguments for responsibility without treating all German people as inherently militaristic.' },
        { title: 'Russia’s choices and motives', text: 'The episode emphasizes Russian preparation and mobilization as escalatory. It connects Russia’s involvement to Serbia, Balkan influence, access through the Turkish straits, and prestige after defeat by Japan and the 1908 Bosnian crisis. This is an interpretation to evaluate alongside the telegrams and other decisions.' },
        { title: 'A broader explanation', text: 'Alliances, imperialism, nationalism, naval rivalry, and beliefs about the inevitability of war remain relevant. The video chooses a diplomatic emphasis; it does not provide an exhaustive account or prove that all countries bear equal responsibility.' },
        { title: 'Reading evidence critically', text: 'Diplomatic records can conflict and justify their authors’ choices. Historians decide what to trust and emphasize. The Willy–Nicky exchange is a useful example: both writers present themselves as peace-seeking while locating the obstacle on the other side.' }
      ],
      takeaway: byId('crash-course-210').takeaway,
      extraSources: [{ label: 'Episode 210 arguments & source analysis', href: '#extra/videos/crash-course-210' }]
    }
  ];
}

function cardMarkup(source, expand) {
  const entries = source.entries?.map(entry => `
    <details class="source-entry" id="${esc(entry.id)}">
      <summary><span class="entry-date">${esc(entry.label)}</span><strong>${esc(entry.title)}</strong></summary>
      <div class="source-entry-body">${entry.reference ? `<p class="mini muted">${esc(entry.reference)}</p>` : ''}
        <p>${esc(entry.text)}</p>${entry.meaning ? `<p class="entry-meaning"><strong>Why it matters:</strong> ${esc(entry.meaning)}</p>` : ''}
      </div>
    </details>`).join('') ?? '';
  return `<details class="supplement-card" id="extra-source-${esc(source.id)}" tabindex="-1" ${expand ? 'open' : ''}>
    <summary><span class="kicker">${esc(source.subtitle)}</span><h3>${esc(source.title)}</h3><p>${esc(source.intro)}</p><span class="source-open-label">Open study notes <span aria-hidden="true">↓</span></span></summary>
    <div class="supplement-body"><p class="source-citation">${esc(source.citation)}</p>
      ${source.blocks.map(block => `<section><h4>${esc(block.title)}</h4><p>${esc(block.text)}</p></section>`).join('')}
      ${entries ? `<section class="source-sequence"><h4>${source.group === 'telegrams' ? 'All ten telegrams · study paraphrases' : 'Keep the dates in order'}</h4>${entries}</section>` : ''}
      <div class="takeaway"><b>What to remember</b><p>${esc(source.takeaway)}</p></div>
      ${source.note ? `<div class="note">${esc(source.note)}</div>` : ''}
      ${source.url ? `<a class="btn small" href="${esc(source.url)}" target="_blank" rel="noopener">Watch this episode on YouTube ↗</a>` : ''}
    </div>
  </details>`;
}

function renderCards(targetId) {
  const term = query.trim().toLocaleLowerCase();
  const matches = content.sources.filter(source =>
    (group === 'all' || source.group === group) &&
    JSON.stringify(source).toLocaleLowerCase().includes(term));
  $('#extra-result-count').textContent = `${matches.length} of ${content.sources.length} source guides`;
  $('#extra-source-list').innerHTML = matches.length
    ? matches.map(source => cardMarkup(source, Boolean(term) || source.id === targetId)).join('')
    : '<div class="empty-search">No matching source guides. Try “mobilization,” “Clapham,” “survival,” or choose All sources.</div>';
  $('[data-expand-extra]').textContent = term ? 'Collapse sources' : 'Expand sources';
}

export function renderSupplement(bits) {
  group = content.groups.some(item => item.id === bits[1]) ? bits[1] : 'all';
  const target = content.sources.find(source => source.id === bits[2] && (group === 'all' || source.group === group));
  if (target) query = '';
  $('#panel-extra').innerHTML = `
    <div class="section-top"><div><p class="kicker">08 / MORE FROM YOUR CLASS</p><h2>Extra Information</h2><p>From failed diplomacy to the experience of war: six source guides to read, compare, and remember.</p></div></div>
    <div class="supplement-intro"><p>${esc(content.note)}</p><a class="source-button" href="#summary/extra-telegrams">Review the key points in Summary →</a></div>
    <nav class="supplement-picker" aria-label="Filter extra information">
      <a href="#extra" ${group === 'all' ? 'aria-current="page"' : ''}>All sources <span>6 guides</span></a>
      ${content.groups.map(item => `<a href="#extra/${esc(item.id)}" ${group === item.id ? 'aria-current="page"' : ''}>${esc(item.title)}<span>${esc(item.description)}</span></a>`).join('')}
    </nav>
    <div class="tools-row"><label class="search-wrap"><span class="sr-only">Search extra information</span><input id="extra-search" class="search" type="search" placeholder="Search a person, event, date, or idea…" value="${esc(query)}"></label><button class="btn small ghost" data-expand-extra>Expand sources</button></div>
    <p id="extra-result-count" class="mini muted" role="status"></p><div id="extra-source-list"></div>
    <section class="supplement-connections"><p class="kicker">COMPARE & CONNECT</p><h3>Use the sources together.</h3><div class="source-table-wrap"><table><caption class="sr-only">Connections between the telegrams, Western Front readings, and video explanations</caption><thead><tr><th scope="col">Theme</th><th scope="col">Evidence to remember</th><th scope="col">What it helps explain</th></tr></thead><tbody>${content.comparisons.map(row => `<tr><th scope="row">${esc(row.theme)}</th><td>${esc(row.evidence)}</td><td>${esc(row.connection)}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="supplement-terms"><p class="kicker">A QUICK REFERENCE</p><h3>Terms to know</h3><dl>${content.terms.map(([term, definition]) => `<dt>${esc(term)}</dt><dd>${esc(definition)}</dd>`).join('')}</dl></section>`;
  renderCards(target?.id);
  if (target) requestAnimationFrame(() => {
    const element = document.getElementById(`extra-source-${target.id}`);
    element.scrollIntoView({ block: 'start', behavior: 'instant' });
    element.focus({ preventScroll: true });
  });
}
