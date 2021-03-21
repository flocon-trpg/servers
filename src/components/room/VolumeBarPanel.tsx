import React from 'react';
import { useDispatch } from 'react-redux';
import VolumeBar from '../../foundations/VolumeBar';
import roomConfigModule from '../../modules/roomConfigModule';
import { useSelector } from '../../store';

type Props = {
    roomId: string;
}

const VolumeBarPanel: React.FC<Props> = ({ roomId }: Props) => {
    const masterVolume = useSelector(state => state.roomConfigModule?.masterVolume);
    const channelVolumes = useSelector(state => state.roomConfigModule?.channelVolumes);
    const seVolume = useSelector(state => state.roomConfigModule?.seVolume);
    const dispatch = useDispatch();

    if (masterVolume == null || channelVolumes == null || seVolume == null) {
        return null;
    }

    const textWidth = 100;

    const toRow = (child: JSX.Element, text: string) => (<div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
        <div style={({ flex: `${textWidth}px` })}>{text}</div>
        <div style={({ flex: 1, margin: '0 16px' })}>{child}</div>
    </div>);

    // Math.roundがないと60.000000001のような中途半端な値が表示されることがある
    const masterVolumeBar = <VolumeBar value={Math.round(masterVolume * 100)} onChange={i => dispatch(roomConfigModule.actions.setOtherValues({ roomId, masterVolume: i / 100 }))} />;
    const channel1VolumeBar = <VolumeBar value={Math.round((channelVolumes['1'] ?? 1) * 100)} onChange={i => dispatch(roomConfigModule.actions.setChannelVolume({ roomId, channelKey: '1', volume: i / 100 }))} />;
    const channel2VolumeBar = <VolumeBar value={Math.round((channelVolumes['2'] ?? 1) * 100)} onChange={i => dispatch(roomConfigModule.actions.setChannelVolume({ roomId, channelKey: '2', volume: i / 100 }))} />;
    const channel3VolumeBar = <VolumeBar value={Math.round((channelVolumes['3'] ?? 1) * 100)} onChange={i => dispatch(roomConfigModule.actions.setChannelVolume({ roomId, channelKey: '3', volume: i / 100 }))} />;
    const channel4VolumeBar = <VolumeBar value={Math.round((channelVolumes['4'] ?? 1) * 100)} onChange={i => dispatch(roomConfigModule.actions.setChannelVolume({ roomId, channelKey: '4', volume: i / 100 }))} />;
    const channel5VolumeBar = <VolumeBar value={Math.round((channelVolumes['5'] ?? 1) * 100)} onChange={i => dispatch(roomConfigModule.actions.setChannelVolume({ roomId, channelKey: '5', volume: i / 100 }))} />;
    const seVolumeBar = <VolumeBar value={Math.round(seVolume * 100)} onChange={i => dispatch(roomConfigModule.actions.setOtherValues({ roomId, seVolume: i / 100 }))} />;

    return (<div style={({ display: 'flex', flexDirection: 'column' })}>
        {toRow(masterVolumeBar, 'マスター音量')}
        {toRow(channel1VolumeBar, 'BGMチャンネル1音量')}
        {toRow(channel2VolumeBar, 'BGMチャンネル2音量')}
        {toRow(channel3VolumeBar, 'BGMチャンネル3音量')}
        {toRow(channel4VolumeBar, 'BGMチャンネル4音量')}
        {toRow(channel5VolumeBar, 'BGMチャンネル5音量')}
        {toRow(seVolumeBar, 'SE音量')}
    </div>);
};

export default VolumeBarPanel;