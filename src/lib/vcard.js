import { profile } from '../data/profile.js'

// Downloads a vCard built from the profile, so a visitor can save Fred
// straight to their phone's contacts.
export function saveContact() {
  const { contact } = profile
  const parts = profile.name.split(' ')
  const family = parts.pop()
  // vCard address order: city; region; postal code; country
  const [city = '', region = '', country = ''] = profile.location.split(',').map((part) => part.trim())
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${family};${parts.join(' ')};;;`,
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    contact.email && `EMAIL;TYPE=INTERNET:${contact.email}`,
    contact.phone && `TEL;TYPE=CELL:${contact.phoneIntl || contact.phone}`,
    contact.github && `URL:${contact.github}`,
    profile.location && `ADR;TYPE=HOME:;;;${city};${region};;${country}`,
    'END:VCARD',
  ].filter(Boolean)
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/vcard' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: `${profile.name.replace(/\s+/g, '-')}.vcf` })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
