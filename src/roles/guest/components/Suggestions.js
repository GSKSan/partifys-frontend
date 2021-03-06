import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Typography from 'layout-components/Typography'
import { SpotifyTrack } from 'layout-components/propTypes'
import { getAlbumCover, getArtistsAsHumanFormat } from 'helpers/tracks'

const Outer = styled.ul`
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 100;

  background: #313131;
  padding: 12px;
  max-height: 350px;
  overflow-y: auto;

  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 1px 12px rgba(0, 0, 0, .25);
`

const Track = styled.li`
  display: flex;
  align-items: center;

  + li {
    margin-top: 8px;
  }

  img {
    width: 50px;
    margin-right: 12px;
  }

  > div {
    flex: 1;
    overflow: hidden;
  }
`

const TrackName = styled(Typography).attrs({
  reverse: true
})`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Artists = styled(Typography).attrs({
  reverse: true,
  type: 'secondary'
})`
  font-size: 80%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Empty = styled.li`
  text-align: center;
  opacity: .65;
  font-style: italic;
  color: #fff;
`

export default function Suggestions ({ tracks, onTrackClick }) {
  return (
    <Outer>
      {tracks.length === 0 && <Empty>No results found</Empty>}
      {tracks.map(track => (
        <Track key={track.id} onClick={() => onTrackClick(track)}>
          <img
            src={getAlbumCover(track)}
            alt={`Album cover for track "${track.name}"`}
          />
          <div>
            <TrackName>{track.name}</TrackName>
            <Artists>
              {getArtistsAsHumanFormat(track)}
            </Artists>
          </div>
        </Track>
      ))}
    </Outer>
  )
}

Suggestions.propTypes = {
  tracks: PropTypes.arrayOf(SpotifyTrack).isRequired,
  onTrackClick: PropTypes.func.isRequired
}
