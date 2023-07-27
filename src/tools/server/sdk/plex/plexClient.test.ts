import { afterEach, describe, expect, it } from 'vitest';
import 'vitest-fetch-mock';

import { PlexClient } from './plexClient';

describe('Plex SDK', () => {
  it('return sessions when player, user and session present', async () => {
    // arrange
    const client = new PlexClient('https://plex.local', 'MY_TOKEN');

    fetchMock.mockOnceIf(
      'https://plex.local/status/sessions?X-Plex-Token=MY_TOKEN',
      `<MediaContainer size="1">
    <Video addedAt="0000000" art="/library/metadata/2/art/00000000" audienceRating="0.0" audienceRatingImage="niceImage" chapterSource="media" contentRating="TV-PG" duration="6262249" guid="plex://movie/0000000000000000" key="/library/metadata/2" lastViewedAt="0000000" librarySectionID="1" librarySectionKey="/library/sections/1" librarySectionTitle="Movies" originalTitle="00000000000000" originallyAvailableAt="0000-00-00" rating="0.0" ratingImage="ratingimage" ratingKey="2" sessionKey="1" studio="Example Studio" summary="Lorem Ispum dolor sit amet" tagline="Yep" thumb="/library/metadata/2/thumb/0000000" title="A long title" titleSort="A short title" type="movie" updatedAt="000000" viewOffset="0" year="0000">
    <Media audioProfile="ma" id="2" videoProfile="high" audioChannels="2" audioCodec="aac" bitrate="20231" container="mp4" duration="6262249" height="1080" optimizedForStreaming="1" protocol="dash" videoCodec="h264" videoFrameRate="24p" videoResolution="1080p" width="1920" selected="1">
    <Part audioProfile="ma" hasThumbnail="1" id="2" videoProfile="high" bitrate="20231" container="mp4" duration="6262249" height="1080" optimizedForStreaming="1" protocol="dash" width="1920" decision="transcode" selected="1">
    <Stream bitDepth="8" bitrate="19975" chromaLocation="left" chromaSubsampling="4:2:0" codec="h264" codedHeight="1088" codedWidth="1920" default="1" displayTitle="XXXX" extendedDisplayTitle="Yes" frameRate="23.975999832153320" hasScalingMatrix="0" height="1080" id="4" level="41" profile="high" refFrames="4" scanType="progressive" streamType="1" title="Example" width="1920" decision="copy" location="segments-video"/>
    <Stream bitrate="256" bitrateMode="cbr" channels="2" codec="aac" default="1" displayTitle="Not Existing" extendedDisplayTitle="Yes, really" id="5" language="Yep" languageCode="jpn" languageTag="ch" selected="1" streamType="2" decision="transcode" location="segments-audio"/>
    </Part>
    </Media>
    <Genre count="13" filter="genre=48" id="48" tag="Drama"/>
    <Genre count="8" filter="genre=104" id="104" tag="Adventure"/>
    <User id="1" thumb="https://google.com" title="example_usr"/>
    <Player address="0.0.0.0" device="Windows" machineIdentifier="72483785378573857385" model="bundled" platform="Chrome" platformVersion="111.0" product="Plex Web" profile="Web" state="paused" title="Chrome" version="0.000.0" local="1" relayed="0" secure="1" userID="1"/>
    <Session id="2894294r2jf2038fj3098jgf3gt" bandwidth="21560" location="lan"/>
    <TranscodeSession key="/transcode/sessions/example-session" throttled="0" complete="0" progress="0" size="-22" speed="18.600000381469727" error="0" duration="100" remaining="70" context="streaming" sourceVideoCodec="h264" sourceAudioCodec="dca" videoDecision="copy" audioDecision="transcode" protocol="dash" container="mp4" videoCodec="h264" audioCodec="aac" audioChannels="2" width="1920" height="1080" transcodeHwRequested="0" transcodeHwFullPipeline="0" timeStamp="1679349635.2791338" maxOffsetAvailable="104.27" minOffsetAvailable="84.166999816894531"/>
    </Video>
    </MediaContainer>`
    );

    // act
    const response = await client.getSessions();

    // assert
    expect(fetchMock.requests().length).toBe(1);
    expect(fetchMock.requests()[0].url).toBe(
      'https://plex.local/status/sessions?X-Plex-Token=MY_TOKEN'
    );
    expect(response).not.toBeNull();
    expect(response.length).toBe(1);
    expect(response[0].id).toBe('2894294r2jf2038fj3098jgf3gt');
    expect(response[0].username).toBe('example_usr');
    expect(response[0].userProfilePicture).toBe('https://google.com');
    expect(response[0].sessionName).toBe('Plex Web (Chrome)');
    expect(response[0].currentlyPlaying).toMatchObject({
      name: 'A long title',
      type: 'movie',
      metadata: {
        video: {
          bitrate: '20231',
          height: '1080',
          videoCodec: 'h264',
          videoFrameRate: '24p',
          width: '1920',
        },
        audio: { audioChannels: '2', audioCodec: 'aac' },
        transcoding: {
          audioChannels: '2',
          audioCodec: 'aac',
          audioDecision: 'transcode',
          container: 'mp4',
          context: 'streaming',
          duration: '100',
          error: false,
          height: '1080',
          sourceAudioCodec: 'dca',
          sourceVideoCodec: 'h264',
          timeStamp: '1679349635.2791338',
          transcodeHwRequested: false,
          videoCodec: 'h264',
          videoDecision: 'copy',
          width: '1920',
        },
      },
    });
  });

  it('return sessions when no player and session present', async () => {
    // arrange
    const client = new PlexClient('http://plex.local', 'ABCYZT');

    fetchMock.mockResponseOnce(`<MediaContainer size="1">
    <Video addedAt="0000000" art="/library/metadata/2/art/00000000" audienceRating="0.0" audienceRatingImage="niceImage" chapterSource="media" contentRating="TV-PG" duration="6262249" guid="plex://movie/0000000000000000" key="/library/metadata/2" lastViewedAt="0000000" librarySectionID="1" librarySectionKey="/library/sections/1" librarySectionTitle="Movies" originalTitle="00000000000000" originallyAvailableAt="0000-00-00" rating="0.0" ratingImage="ratingimage" ratingKey="2" sessionKey="1" studio="Example Studio" summary="Lorem Ispum dolor sit amet" tagline="Yep" thumb="/library/metadata/2/thumb/0000000" title="A long title" titleSort="A short title" type="movie" updatedAt="000000" viewOffset="0" year="0000">
    <Media audioProfile="ma" id="2" videoProfile="high" audioChannels="2" audioCodec="aac" bitrate="20231" container="mp4" duration="6262249" height="1080" optimizedForStreaming="1" protocol="dash" videoCodec="h264" videoFrameRate="24p" videoResolution="1080p" width="1920" selected="1">
    <Part audioProfile="ma" hasThumbnail="1" id="2" videoProfile="high" bitrate="20231" container="mp4" duration="6262249" height="1080" optimizedForStreaming="1" protocol="dash" width="1920" decision="transcode" selected="1">
    <Stream bitDepth="8" bitrate="19975" chromaLocation="left" chromaSubsampling="4:2:0" codec="h264" codedHeight="1088" codedWidth="1920" default="1" displayTitle="XXXX" extendedDisplayTitle="Yes" frameRate="23.975999832153320" hasScalingMatrix="0" height="1080" id="4" level="41" profile="high" refFrames="4" scanType="progressive" streamType="1" title="Example" width="1920" decision="copy" location="segments-video"/>
    <Stream bitrate="256" bitrateMode="cbr" channels="2" codec="aac" default="1" displayTitle="Not Existing" extendedDisplayTitle="Yes, really" id="5" language="Yep" languageCode="jpn" languageTag="ch" selected="1" streamType="2" decision="transcode" location="segments-audio"/>
    </Part>
    </Media>
    <Genre count="13" filter="genre=48" id="48" tag="Drama"/>
    <Genre count="8" filter="genre=104" id="104" tag="Adventure"/>
    <User />
    <Player address="0.0.0.0" device="Windows" machineIdentifier="72483785378573857385" model="bundled" platform="Chrome" platformVersion="111.0" product="Plex Web" profile="Web" state="paused" title="Chrome" version="0.000.0" local="1" relayed="0" secure="1" userID="1"/>
    <TranscodeSession key="/transcode/sessions/example-session" throttled="0" complete="0" progress="0" size="-22" speed="18.600000381469727" error="0" duration="100" remaining="70" context="streaming" sourceVideoCodec="h264" sourceAudioCodec="dca" videoDecision="copy" audioDecision="transcode" protocol="dash" container="mp4" videoCodec="h264" audioCodec="aac" audioChannels="2" width="1920" height="1080" transcodeHwRequested="0" transcodeHwFullPipeline="0" timeStamp="1679349635.2791338" maxOffsetAvailable="104.27" minOffsetAvailable="84.166999816894531"/>
    </Video>
    </MediaContainer>`);

    // act
    const response = await client.getSessions();

    // assert
    expect(fetchMock.requests().length).toBe(1);
    expect(fetchMock.requests()[0].url).toBe(
      'http://plex.local/status/sessions?X-Plex-Token=ABCYZT'
    );
    expect(response.length).toBe(1);
    expect(response[0]).toMatchObject({
      id: undefined,
      username: 'Anonymous',
      userProfilePicture: undefined,
      sessionName: 'Plex Web (Chrome)',
      currentlyPlaying: {
        name: 'A long title',
        type: 'movie',
      },
    });
  });

  it('return empty if no media container', async () => {
    // arrange
    const client = new PlexClient('http://plex.local', 'Homarr');

    fetchMock.mockResponseOnce('<MediaContainer size="1"></MediaContainer>');

    // act
    const response = await client.getSessions();

    // assert
    expect(fetchMock.requests().length).toBe(1);
    expect(response.length).toBe(0);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });
});
