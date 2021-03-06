import { takeEvery } from 'redux-saga/effects'
import { GUEST_READY } from 'roles/host/actions/guests'
import { ADD_TO_BATTLE } from 'roles/host/actions/tracks'
import notifyBattleUpdate from 'roles/host/sagas/tasks/notifyBattleUpdate'
import searchTracks from 'roles/host/sagas/tasks/guests/searchTracks'
import addTrack from 'roles/host/sagas/tasks/guests/addTrack'
import guestFlow from './guestFlow'

describe('guestFlow', () => {
  const gen = guestFlow()

  it('Should handle the guest flow', () => {
    // Should answer to guest searches
    expect(gen.next().value).toEqual(takeEvery('@guest/search', searchTracks))

    // Should answer to guest adding tracks
    expect(gen.next().value).toEqual(takeEvery('@guest/track/add', addTrack))

    expect(gen.next().value).toEqual(
      takeEvery(ADD_TO_BATTLE, notifyBattleUpdate)
    )
  })
})
