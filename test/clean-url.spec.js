import { expect } from 'chai'
import { originRequest } from './helpers'

describe('integration: cleanUrls', () => {
  const config = {
    cleanUrls: ['/foo', '/hey*']
  }

  it('uses clean urls with sources (matches)', async () => {
    const args = originRequest(config, '/heyo.html')
    expect(args[1].status).to.equal('301')
    expect(args[1].headers.location[0].value).to.equal('/heyo')
  })

  it('uses clean urls with sources (does not match)', async () => {
    const args = originRequest(config, '/hello')
    expect(args[1].uri).to.equal('/hello')
  })

  it('uses clean urls for all', async () => {
    const config = { cleanUrls: true }
    const args = originRequest(config, '/hello')
    expect(args[1].uri).to.equal('/hello.html')
  })

  it('uses clean urls with html extension', async () => {
    const config = { cleanUrls: true }
    const args = originRequest(config, '/hello.html')
    expect(args[1].status).to.equal('301')
    expect(args[1].headers.location[0].value).to.equal('/hello')
  })

  it('uses clean urls with index file', async () => {
    const config = { cleanUrls: true }
    const args = originRequest(config, '/index.html')
    expect(args[1].status).to.equal('301')
    expect(args[1].headers.location[0].value).to.equal('/')
  })

  it.skip('adds index.html for origin', async () => {
    const config = { cleanUrls: true }
    const args = originRequest(config, '/hello/')
    expect(args[1].uri).to.equal('/hello/index.html')
  })
})
