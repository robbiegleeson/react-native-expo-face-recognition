import React from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';
import { FaceDetector, Camera, Permissions, Constants, MediaLibrary } from 'expo';

export default class App extends React.Component {
  state = {
      hasCameraPermission: null,
      hasCameraRollPermissions: null,
      faces : [],
      faceDetecting: true,
    }
    async componentWillMount() {
       const { status } = await Permissions.askAsync(Permissions.CAMERA);
       const { cameraRollStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
       this.setState({
         hasCameraPermission:status === 'granted',
         hasCameraRollPermissions:cameraRollStatus === 'granted'
        });
    }

    renderFaces = () => 
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>

    renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  }

  handleFacesDetected = ({ faces }) => {
    if(faces.length >= 0){
      this.detectFaces(false);
      this.setState({ faces });
      this.takePicture();
    }
  };

  takePicture = () => {
    this.setState({
      pictureTaken: true,
    });
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  }

  onPictureSaved = async (data) => {
    const asset = await MediaLibrary.createAssetAsync(data.uri);
    console.log('asset', asset);
    MediaLibrary.createAlbumAsync('MyFace', asset)
      .then(() => {
        this.detectFaces(true);
        Vibration.vibrate();
      })
      .catch(error => {
        this.detectFaces(true);
        Vibration.vibrate();
      });
  }

  detectFaces(doDetect){
    this.setState({
      faceDetecting: doDetect,
    });
  }

  render() {
    const { hasCameraPermission, faces, faceDetecting } = this.state;
    
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={styles.container}>
          <Camera
             style={styles.camera}
             type={'front'}
             onFacesDetected={faceDetecting ? this.handleFacesDetected : undefined}
             faceDetectorSettings={{
               mode: FaceDetector.Constants.Mode.accurate,
               detectLandmarks: FaceDetector.Constants.Mode.none,
               runClassifications: FaceDetector.Constants.Classifications.all
             }}
             ref={ref => { this.camera = ref }}>
              <View style={styles.topBar}>
                <Text style={styles.textcolor}>x: {this.state.faces.length ? this.state.faces[0].bounds.origin.x.toFixed(0) : 0}</Text>
                <Text style={styles.textcolor}>y: {this.state.faces.length ? this.state.faces[0].bounds.origin.y.toFixed(0) : 0}</Text>
              </View>
              <View style={styles.bottomBar}>
                <Text style={styles.textcolor}>Heigth: {this.state.faces.length ? this.state.faces[0].bounds.size.height.toFixed(0) : 0}</Text>
                <Text style={styles.textcolor}>width: {this.state.faces.length ? this.state.faces[0].bounds.size.width.toFixed(0) : 0}</Text>
              </View>
              <View>
                <Text style={{ color: '#FFF' }}>{`Faces in view: ${faces.length}`}</Text>
                </View>
             </Camera>
             { faceDetecting && this.state.faces.length ? this.renderFaces() : undefined}
           
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight+1,
  },
  bottomBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  face: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 1,
    position: 'absolute',
    borderColor: '#808000',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  faceText: {
    color: '#32CD32',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  textcolor:{
    color: '#008080',
  }
});