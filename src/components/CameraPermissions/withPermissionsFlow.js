import { h, Component } from 'preact'
import PermissionsPrimer from '../CameraPermissions/Primer'
import PermissionsRecover from '../CameraPermissions/Recover'
import { checkIfWebcamPermissionGranted } from '~utils'

const permissionErrors = [
  'PermissionDeniedError',
  'NotAllowedError',
  'NotFoundError',
]

/* type State = {
  hasGrantedPermission: ?boolean,
  hasSeenPermissionsPrimer: boolean,
  checkingWebcamPermissions: boolean,
}

type InjectedProps = {
  hasGrantedPermission: boolean,
  onUserMedia: () => void,
  onFailure: (Error) => void,
} */

export default (WrappedCamera) =>
  class WithPermissionFlow extends Component {
    static defaultProps = {
      onUserMedia: () => {},
      onFailure: () => {},
    }

    state = {
      hasGrantedPermission: null,
      hasSeenPermissionsPrimer: false,
      checkingWebcamPermissions: true,
    }

    componentDidMount() {
      checkIfWebcamPermissionGranted((value) =>
        this.setState({
          checkingWebcamPermissions: false,
          hasGrantedPermission: value || null,
        })
      )
    }

    setPermissionsPrimerSeen = () => {
      this.setState({ hasSeenPermissionsPrimer: true })
    }

    handleUserMedia = () => {
      this.setState({ hasGrantedPermission: true })
      this.props.onUserMedia()
    }

    handleWebcamFailure = (error) => {
      if (permissionErrors.includes(error.name)) {
        this.setState({ hasGrantedPermission: false })
      } else {
        this.props.onFailure()
      }
    }

    render() {
      const {
        hasSeenPermissionsPrimer,
        hasGrantedPermission,
        checkingWebcamPermissions,
      } = this.state
      const { trackScreen } = this.props

      // while checking if we have permission or not, don't render anything
      // otherwise we'll see a flicker, after we do work out what's what
      if (checkingWebcamPermissions) return null

      return hasGrantedPermission === false ? (
        <PermissionsRecover {...{ trackScreen }} />
      ) : hasGrantedPermission || hasSeenPermissionsPrimer ? (
        <WrappedCamera
          {...this.props}
          hasGrantedPermission={hasGrantedPermission}
          onUserMedia={this.handleUserMedia}
          onFailure={this.handleWebcamFailure}
        />
      ) : (
        <PermissionsPrimer
          {...{ trackScreen }}
          onNext={this.setPermissionsPrimerSeen}
        />
      )
    }
  }
