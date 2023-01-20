import { gql } from '@apollo/client';
import { createColumnHelper } from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { AlbumTracksTable_tracks as Track } from '../types/api';
import AlbumTrackTitleCell from './AlbumTrackTitleCell';
import ContextMenu from './ContextMenu';
import ContextMenuAction from './ContextMenuAction';
import Duration from './Duration';
import Table from './Table';

interface AlbumTracksTableProps {
  tracks: Track[];
}

const columnHelper = createColumnHelper<Track>();

const columns = [
  columnHelper.accessor('trackNumber', { header: '#', meta: { shrink: true } }),
  columnHelper.display({
    id: 'title',
    header: 'Title',
    cell: (info) => {
      return <AlbumTrackTitleCell track={info.row.original} />;
    },
  }),
  columnHelper.accessor('durationMs', {
    header: () => <Clock size="1rem" />,
    cell: (info) => <Duration durationMs={info.getValue()} />,
    meta: {
      headerAlign: 'right',
      shrink: true,
    },
  }),
];

const AlbumTracksTable = ({ tracks }: AlbumTracksTableProps) => {
  return (
    <Table
      columns={columns}
      data={tracks}
      contextMenu={(row) => {
        const track = row.original;

        return (
          <>
            <ContextMenuAction.AddToQueue uri={track.uri} />
            <ContextMenu.Separator />
            <ContextMenu.Link to={`/artists/${track.artists[0].id}`}>
              Go to artist
            </ContextMenu.Link>
            <ContextMenu.Separator />
            <ContextMenuAction.OpenDesktopApp uri={track.uri} />
          </>
        );
      }}
    />
  );
};

AlbumTracksTable.fragments = {
  tracks: gql`
    fragment AlbumTracksTable_tracks on Track {
      id
      uri
      durationMs
      trackNumber
      artists {
        id
      }

      ...AlbumTrackTitleCell_track
    }

    ${AlbumTrackTitleCell.fragments.track}
  `,
};

export default AlbumTracksTable;
