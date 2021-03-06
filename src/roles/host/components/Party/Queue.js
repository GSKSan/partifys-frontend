import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import Typography from 'layout-components/Typography'
import { SpotifyTrack } from 'layout-components/propTypes'
import { getAlbumCover, getArtistsAsHumanFormat } from 'helpers/tracks'
import { getQueue } from 'roles/host/reducers'

const Title = styled(Typography).attrs({
  reverse: true,
  variant: 'display2'
})`
  text-align: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, .15);
`

const Outer = styled.div`
  position: relative;
  background: rgba(0, 0, 0, .9);
  padding: 12px;
  width: 250px;
  overflow-y: auto;
`

const trackEnterAnimation = keyframes`
  from {
    transform: translateY(15px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const Track = styled.li`
  display: flex;
  animation: ${trackEnterAnimation} 1s ease;

  + li {
    margin-top: 12px;
  }

  > div {
    overflow: hidden;
  }

  p {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`

const Cover = styled.img`
  width: 55px;
  align-self: center;
  margin-right: 8px;
`

function Queue ({ tracks }) {
  if (tracks.length === 0) {
    return null
  }

  return (
    <Outer>
      <Title>Up next</Title>
      <ul>
        {tracks.map(track => (
          <Track key={track.id}>
            <Cover src={getAlbumCover(track)} />
            <div>
              <Typography reverse>{track.name}</Typography>
              <Typography reverse type='secondary'>
                {getArtistsAsHumanFormat(track)}
              </Typography>
            </div>
          </Track>
        ))}
      </ul>
    </Outer>
  )
}

Queue.propTypes = {
  tracks: PropTypes.arrayOf(SpotifyTrack).isRequired
}

export default connect(state => ({
  tracks: getQueue(state)
}))(Queue)
