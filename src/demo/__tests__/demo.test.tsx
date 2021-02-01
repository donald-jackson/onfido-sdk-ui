import { h, FunctionComponent } from 'preact'
import { mount } from 'enzyme'

declare global {
  interface Window {
    domNode: HTMLElement
  }
}

jest.mock('../../Tracker/safeWoopra')

jest.mock('../demoUtils', () => ({
  getInitSdkOptions: jest.fn().mockReturnValue({}),
  queryParamToValueString: { useHistory: false },
  getTokenFactoryUrl: () => 'https://token-factory.onfido.com/sdk_token',
  getToken: jest
    .fn()
    .mockImplementation((_hasPreview, _url, _eventEmitter, onSuccess) =>
      onSuccess('TEST_TOKEN')
    ),
}))

const mockedConsole = jest.fn()
console.log = mockedConsole

describe('Mount Demo App', () => {
  let Demo: FunctionComponent = null

  beforeEach(() => {
    // create rootNode
    const rootNode = document.createElement('div')
    rootNode.setAttribute('id', 'demo-app')
    window.domNode = rootNode
    document.body.appendChild(rootNode)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('by mocking Onfido SDK', () => {
    beforeEach(() => {
      window.Onfido = {
        init: jest.fn().mockImplementation(() => ({
          options: {},
          setOptions: jest.fn(),
          tearDown: jest.fn(),
        })),
      }

      Demo = require('../demo').Demo
    })

    it('mounts the Onfido Demo without crashing', () => {
      const sdkDemo = mount(<Demo />)
      expect(sdkDemo.exists()).toBeTruthy()
      expect(window.Onfido.init).toHaveBeenCalled()
      expect(mockedConsole).toHaveBeenCalledWith(
        '* JWT Factory URL:',
        'https://token-factory.onfido.com/sdk_token',
        'for',
        'EU',
        'in',
        process.env.NODE_ENV
      )
    })
  })

  describe('without mocking Onfido SDK', () => {
    beforeEach(() => {
      Demo = require('../demo').Demo
    })

    it('mounts the Onfido Demo without crashing', () => {
      const sdkDemo = mount(<Demo />)
      expect(sdkDemo.exists()).toBeTruthy()
      expect(mockedConsole).toHaveBeenCalledWith(
        '* JWT Factory URL:',
        'https://token-factory.onfido.com/sdk_token',
        'for',
        'EU',
        'in',
        process.env.NODE_ENV
      )
    })
  })
})
