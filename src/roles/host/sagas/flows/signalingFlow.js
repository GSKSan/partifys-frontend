import { eventChannel, END } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'
import {
  SIGNALING_IN_JOIN,
  SIGNALING_IN_ANSWER,
  SIGNALING_IN_CANDIDATE,
  SIGNALING_IN_LEAVE
} from 'roles/host/actions/signaling'
import { ADD_GUEST, GUEST_READY } from 'roles/host/actions/guests'
import iceServers from 'helpers/iceServers'
import { getGuest } from 'roles/host/reducers'
import { addGuest, guestDisconnected, guestReady } from 'roles/host/actions/guests'
import watchGuestEvents from 'roles/host/sagas/tasks/watchGuestEvents'
import initializeGuest from 'roles/host/sagas/tasks/initializeGuest'

const noop = () => {}

// TODO: Extract some functions from this flow

/**
 * Sends the local description to a guest.
 * @param {SocketIOClient.Socket} socket - The server connection.
 * @param {String} remoteId - The remote guest id.
 * @param {String} description - The local description.
 */
export function * sendOffer (socket, remoteId, description) {
  yield call([socket, socket.emit], 'signaling/offer', {
    remoteId,
    description
  })
}

/**
 * Sends a local ICE candidate to a guest.
 * @param {SocketIOClient.Socket} socket - The server connection.
 * @param {String} remoteId - The remote guest id.
 * @param {String} candidate - The local ice candidate.
 */
export function * sendCandidate (socket, remoteId, candidate) {
  yield call([socket, socket.emit], 'signaling/candidate', {
    remoteId,
    candidate
  })
}

/**
 * Initiates the peer connection process.
 * @param {SocketIOClient.Socket} socket - The socket to emit to.
 * @param {{ type: String, remoteId: String, userId: String }} action - The join action.
 */
export function * onJoin (socket, action) {
  console.log('<-- ON JOIN', action)
  const connection = new RTCPeerConnection({ iceServers })
  const dataChannel = connection.createDataChannel(`channel/${action.remoteId}`)
  console.log(dataChannel)
  const localDescription = yield call([connection, connection.createOffer])
  const localCandidatesChannel = eventChannel(emit => {
    connection.onicecandidate = e => {
      if (e.candidate) {
        emit(e.candidate)
      } else {
        emit(END)
      }
    }

    return noop
  })

  yield takeEvery(
    localCandidatesChannel,
    sendCandidate,
    socket,
    action.remoteId
  )
  yield call([connection, connection.setLocalDescription], localDescription)
  yield call(sendOffer, socket, action.remoteId, localDescription)

  // TODO: Remove previous guests with the same user id and close their data channels
  yield put(
    addGuest(
      action.remoteId,
      `Anonymous-${action.remoteId}`,
      connection,
      dataChannel
    )
  )

  yield new Promise(resolve => (dataChannel.onopen = resolve))

  yield put(guestReady(action.remoteId))

  // FIXME: DataChannel.onclose is never being called ???
  yield new Promise(resolve => (dataChannel.onclose = resolve))

  yield put(guestDisconnected(action.remoteId))
}

/**
 * Sets the remote description for the given guest.
 * @param {{ remoteId: String, description: String }} action - The answer action.
 */
export function * onAnswer (action) {
  console.log('<-- ON ANSWER')
  const guest = yield select(getGuest, action.remoteId)

  if (guest) {
    yield call(
      [guest.connection, guest.connection.setRemoteDescription],
      action.description
    )
  }
}

/**
 * Sets the remote ICE candidate for the given guest.
 * @param {{ remoteId: String, candidate: String }} action - The candidate action.
 */
export function * onCandidate (action) {
  console.log('<-- ON CANDIDATE')
  const guest = yield select(getGuest, action.remoteId)

  if (guest) {
    yield call(
      [guest.connection, guest.connection.addIceCandidate],
      action.candidate
    )
  }
}

/**
 * Removes a guest when it leaves.
 * @param {{ remoteId: String }} action
 */
export function * onLeave (action) {
  yield put(guestDisconnected(action.remoteId))
}

/**
 * Starts sub-sagas for handling the signaling process when a new
 * guest joins the party.
 * @param {SocketIOClient.Socket} socket - The server connection.
 */
export default function * signalingFlow (socket) {
  yield takeEvery(SIGNALING_IN_JOIN, onJoin, socket)
  yield takeEvery(SIGNALING_IN_ANSWER, onAnswer)
  yield takeEvery(SIGNALING_IN_CANDIDATE, onCandidate)
  yield takeEvery(SIGNALING_IN_LEAVE, onLeave)
  yield takeEvery(ADD_GUEST, watchGuestEvents)
  yield takeEvery(GUEST_READY, initializeGuest)
}
