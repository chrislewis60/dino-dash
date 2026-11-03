import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SPEC_DIRECTORY = 'docs/specs'
const SKILL_DIRECTORY = '.github/skills'
const SKILLS = [
  'discover-project',
  'enable-toolkit',
  'assess-delivery-readiness',
  'analyse-context',
  'challenge-solution',
  'define-acceptance-criteria',
  'write-specification',
  'write-acceptance-tests',
  'implement-code',
  'review-code',
  'assess-security',
  'review-accessibility',
  'validate-tests',
  'visual-walkthrough',
  'evidence-pack',
  'build-handover',
  'harvest-learnings',
] as const
const PROMPTS = [
  { name: 'initiate', agent: 'Onboarding' },
  { name: 'evolves', agent: 'Onboarding' },
  { name: 'deliver', agent: 'Playbook' },
] as const
const CUSTOMISATIONS = [
  ...SKILLS.map((name) => `${SKILL_DIRECTORY}/${name}/SKILL.md`),
  ...PROMPTS.map(({ name }) => `.github/prompts/${name}.prompt.md`),
  '.github/agents/onboarding.agent.md',
  '.github/agents/playbook.agent.md',
]
const DOCUMENT_DIRECTORIES = [
  'docs/adr',
  'docs/architecture',
  'docs/delivery',
  'docs/guides',
  'docs/registers',
  SPEC_DIRECTORY,
  'docs/standards',
  'docs/templates',
]

function read(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf8')
}

function markdownFiles(directory: string): string[] {
  return readdirSync(resolve(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}

function frontmatter(text: string): Map<string, string> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
  if (!block) throw new Error('Missing YAML frontmatter')

  const fields = new Map<string, string>()
  for (const line of block[1].split(/\r?\n/)) {
    const field = /^([a-z][a-z-]*): (.+)$/.exec(line)
    if (!field) throw new Error(`Invalid scalar frontmatter: ${line}`)
    const [, key, rawValue] = field
    if (fields.has(key)) throw new Error(`Duplicate frontmatter key: ${key}`)
    let value = rawValue
    if (rawValue.startsWith("'")) {
      if (!/^'(?:[^']|'')*'$/.test(rawValue)) {
        throw new Error(`Invalid quoted frontmatter: ${key}`)
      }
      value = rawValue.slice(1, -1).replaceAll("''", "'")
    } else if (!/^[\w -]+$/.test(rawValue)) {
      throw new Error(`Unsupported scalar frontmatter: ${key}`)
    }
    if (!value.trim()) throw new Error(`Empty frontmatter: ${key}`)
    fields.set(key, value)
  }
  return fields
}

function assertLocalLinks(text: string, file: string): void {
  const withoutCode = text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '')
  for (const match of withoutCode.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1]
    if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('#')) continue
    const path = decodeURIComponent(target.split('#')[0])
    const absolute = resolve(dirname(resolve(ROOT, file)), path)
    if (!existsSync(absolute)) {
      throw new Error(`Broken link in ${file}: ${target} (${relative(ROOT, absolute)})`)
    }
  }
}

function assertTraceability(text: string): void {
  const requirements = [...text.matchAll(/^\| (SPEC-\d{3}-R\d{2}) \|/gm)]
    .map((match) => match[1])
  const criteria = [...text.matchAll(/^### (SPEC-\d{3}-AC\d{2})$/gm)]
    .map((match) => match[1])
  const covered = [...text.matchAll(/^Covers: ([^\r\n]+)/gm)]
    .flatMap((match) => match[1].match(/SPEC-\d{3}-R\d{2}/g) ?? [])
  const verified = [...text.matchAll(/^\| (SPEC-\d{3}-AC\d{2}) \|/gm)]
    .map((match) => match[1])

  const isSmall = /^(?:Size: |\| (?:Size|Version \/ size) \| (?:\d+ \/ )?)Small\b/m.test(text)
  if (!isSmall) expect(requirements.length).toBeGreaterThan(0)
  expect(criteria.length).toBeGreaterThan(0)
  expect(new Set(requirements).size).toBe(requirements.length)
  expect(new Set(criteria).size).toBe(criteria.length)
  expect([...new Set(covered)].sort()).toEqual([...requirements].sort())
  expect(verified.sort()).toEqual([...criteria].sort())
  if (requirements.length > 0) {
    for (const section of text.split(/^### SPEC-\d{3}-AC\d{2}\r?$/m).slice(1)) {
      expect(section).toMatch(/^\s+Covers: SPEC-\d{3}-R\d{2}/)
    }
  }
}

const DOCUMENTS = [
  'README.md',
  'GAME_DESIGN.md',
  'docs/README.md',
  'docs/project-profile.md',
  'docs/project-profile.template.md',
  ...DOCUMENT_DIRECTORIES.flatMap(markdownFiles),
  ...CUSTOMISATIONS,
]

describe('SPEC-004 Playbook adoption contracts', () => {
  it.each(CUSTOMISATIONS)('SPEC-004-AC01 validates new metadata: %s', (file) => {
    const metadata = frontmatter(read(file))
    expect(metadata.get('name')).toBeTruthy()
    expect(metadata.get('description')).toBeTruthy()
    expect(metadata.has('model')).toBe(false)
    if (file.endsWith('SKILL.md')) {
      expect(metadata.get('name')).toBe(dirname(file).split('/').at(-1))
      expect(metadata.get('name')).toMatch(/^[a-z\d]+(?:-[a-z\d]+)*$/)
      expect(metadata.get('user-invocable')).toBe('false')
    }
  })

  it.each(PROMPTS)('SPEC-004-AC01 routes /$name to $agent', ({ name, agent }) => {
    const metadata = frontmatter(read(`.github/prompts/${name}.prompt.md`))
    expect(metadata.get('name')).toBe(name)
    expect(metadata.get('agent')).toBe(agent)
    expect(frontmatter(read(`.github/agents/${agent.toLowerCase()}.agent.md`)).get('name'))
      .toBe(agent)
  })

  it('SPEC-004-AC01 names existing skills in the relevant orchestration agent', () => {
    const agents = read('.github/agents/onboarding.agent.md')
      + read('.github/agents/playbook.agent.md')
    for (const skill of SKILLS) expect(agents).toContain(skill)
    expect(readdirSync(resolve(ROOT, SKILL_DIRECTORY))).toEqual(expect.arrayContaining([...SKILLS]))
  })

  it.each(DOCUMENTS)('SPEC-004-AC02 resolves local links: %s', (file) => {
    assertLocalLinks(read(file), file)
  })

  it.each(markdownFiles(SPEC_DIRECTORY))('SPEC-004-AC02 traces requirements: %s', (file) => {
    assertTraceability(read(file))
  })

  it.each(markdownFiles('docs/adr'))('SPEC-004-AC03 records ADR status and options: %s', (file) => {
    const text = read(file)
    for (const heading of ['Context', 'Decision', 'Options considered', 'Consequences']) {
      expect(text).toContain(`## ${heading}`)
    }
    if (file.includes('0005-')) {
      expect(text).toMatch(/^Status: Proposed/m)
    } else {
      expect(text).toMatch(/^Status: Retrospective; rationale inferred; awaiting human review/m)
      expect(text).toContain('Original decision date and deciders: Unknown')
      expect(text).toContain('uncommitted gameplay changes')
    }
    expect(text).not.toMatch(/^Status: Accepted/m)
  })

  it('SPEC-004-AC04 retains human gates, continued build and pre-release stop', () => {
    const playbook = read('.github/agents/playbook.agent.md')
    const standard = read('docs/standards/delivery.md')
    expect(playbook).toContain('Agents never approve gates')
    expect(playbook).toContain('continue to Build while G1 is pending')
    expect(playbook).toContain('Before G5, stop while blockers remain')
    for (const gate of ['G0', 'G1', 'G2', 'G3', 'G4', 'G5']) {
      expect(standard).toContain(`| ${gate} |`)
    }
    expect(read('docs/delivery/readiness.md')).toContain('Status: Waiting for human')
    for (const file of ['run.md', 'evidence-pack.md', 'readiness.md']) {
      expect(read(`docs/templates/${file}`)).toMatch(/version/i)
      expect(read(`docs/templates/${file}`)).toContain('Approver')
    }
  })

  it('SPEC-004-AC05 uses existing project commands and records limits', () => {
    const manifest: unknown = JSON.parse(read('package.json'))
    expect(manifest).toMatchObject({
      scripts: {
        build: 'tsc -b && vite build',
        lint: 'eslint .',
        test: 'vitest run',
      },
    })
    const profile = read('docs/project-profile.md')
    for (const command of ['npm run build', 'npm run lint', 'npm test']) {
      expect(profile).toContain(command)
    }
    expect(profile).toContain('remain Unverified')
    expect(profile).toContain('tested rollback are **Unknown**')
    expect(profile).toContain('There is no `format` script')
  })

  it('SPEC-004-AC06 supplies the reusable artefact templates', () => {
    for (const file of [
      'specification.md', 'adr.md', 'readiness.md', 'run.md', 'evidence-pack.md', 'handover.md',
    ]) {
      expect(read(`docs/templates/${file}`).length).toBeGreaterThan(100)
    }
  })

  it('SPEC-004-AC06 rejects missing links instead of silently passing', () => {
    expect(() => assertLocalLinks('[missing](does-not-exist.md)', 'docs/README.md'))
      .toThrow('Broken link')
  })

  it('SPEC-004-AC06 rejects malformed and duplicate scalar frontmatter', () => {
    expect(() => frontmatter('# no metadata')).toThrow('Missing YAML')
    expect(() => frontmatter('---\nname: test\nname: duplicate\n---\n')).toThrow('Duplicate')
    expect(() => frontmatter("---\ndescription: 'unclosed\n---\n")).toThrow('Invalid quoted')
    expect(() => frontmatter('---\ndescription: unquoted: colon\n---\n'))
      .toThrow('Unsupported scalar')
  })

  it('SPEC-004-AC06 rejects missing requirement coverage and orphan AC mappings', () => {
    const fixture = [
      '| SPEC-999-R01 | Requirement |',
      '### SPEC-999-AC01',
      'Covers: SPEC-999-R01.',
      '| SPEC-999-AC01 | Manual evidence | Unverified |',
    ].join('\n')
    expect(() => assertTraceability(fixture)).not.toThrow()
    expect(() => assertTraceability(fixture.replace('Covers: SPEC-999-R01.', 'Covers: None.')))
      .toThrow()
    expect(() => assertTraceability(fixture.replace('| SPEC-999-AC01', '| SPEC-999-AC02')))
      .toThrow()
  })

  it('SPEC-004-AC06 permits concise Small specs but still requires AC evidence', () => {
    const fixture = [
      'Size: Small, bounded documentation correction',
      '## Context and scope',
      'Correct a label without changing behaviour.',
      '### SPEC-999-AC01',
      'Given the corrected label, then it matches the agreed wording.',
      '| SPEC-999-AC01 | Manual review | Unverified |',
    ].join('\n')
    expect(() => assertTraceability(fixture)).not.toThrow()
    expect(() => assertTraceability(fixture.replace('Size: Small', 'Size: Standard'))).toThrow()
    expect(() => assertTraceability(fixture.replace('| SPEC-999-AC01', '| SPEC-999-AC02')))
      .toThrow()
  })
})
