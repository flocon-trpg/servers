import { delay } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import {
    FileBrowser,
    Props as FileBrowserProps,
    FilePath,
    image,
    others,
    sound,
} from './FileBrowser';

type FileSource =
    | {
          type: typeof sound | typeof others;
          path: string;
      }
    | {
          type: typeof image;
          path: string;
          thumb?: React.ReactNode;
      };

type PracticalProps = {
    filesSource: FileSource[];
    style?: React.CSSProperties;
};

const toFilePath = (filesSourceRef: { current: FileSource[] }): FilePath[] => {
    return filesSourceRef.current.map((file): FilePath => {
        const onClick = () => console.log('clicked', file.path);
        const onDelete = async () => {
            await delay(1000);
            if (file.type !== others) {
                return Promise.reject(new Error('fake error'));
            }
            filesSourceRef.current = filesSourceRef.current.filter(x => x.path !== file.path);
        };
        if (file.type === image) {
            return {
                fileType: file.type,
                path: file.path,
                key: file.path,
                onClick,
                onDelete,
                thumb: file.thumb,
            };
        }
        return {
            fileType: file.type,
            path: file.path,
            key: file.path,
            onClick,
            onDelete,
            icon: file.type,
        };
    });
};

const Practical: React.FC<PracticalProps> = ({ filesSource, style }: PracticalProps) => {
    const filesSourceRef = React.useRef(filesSource);
    React.useEffect(() => {
        filesSourceRef.current = filesSource;
    }, [filesSource]);
    const [filesState, setFilesState] = React.useState<FilePath[]>([]);
    React.useEffect(() => {
        setFilesState(toFilePath(filesSourceRef));
    }, []);

    return (
        <FileBrowser
            files={filesState}
            style={style}
            onShouldUpdateFilesList={() => {
                setFilesState(toFilePath(filesSourceRef));
            }}
            fileTypes={{
                defaultFileTypeFilter: null,
                fileTypes: [
                    {
                        fileType: image,
                        name: '画像',
                    },
                    {
                        fileType: sound,
                        name: '音声',
                    },
                    {
                        fileType: others,
                        name: 'その他',
                    },
                ],
            }}
            disableCreate={() => false}
            onFileCreate={() => Promise.resolve(true)}
        />
    );
};

type Props = {
    style?: FileBrowserProps['style'];
    files?: FileBrowserProps['files'] | undefined;
    filesSource?: FileSource[];
};

export const Default: React.FC<Props> = ({ files, filesSource, style }) => {
    if (files == null) {
        if (filesSource == null) {
            throw new Error();
        }
        return <Practical filesSource={filesSource} style={style} />;
    }

    if (filesSource != null) {
        throw new Error();
    }

    return (
        <FileBrowser
            files={files}
            style={style}
            disableCreate={() => false}
            onFileCreate={() => Promise.resolve(true)}
        />
    );
};

export default {
    title: 'models/file/FileBrowser',
    component: Default,
    args: {
        style: {
            height: 300,
        },
        filesSource: [
            {
                type: image,
                path: 'image1.png',
            },
            {
                type: image,
                path: 'image2.png',
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/100x100/fff/000'
                    />
                ),
            },
            {
                type: image,
                path: 'image3.png',
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/200x100/fff/000'
                    />
                ),
            },
            {
                type: image,
                path: 'image4.png',
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/100x200/fff/000'
                    />
                ),
            },
            {
                type: sound,
                path: 'sound.mp3',
            },
            {
                type: others,
                path: 'others.dll',
            },
            {
                type: others,
                path: 'long-filename-123456.dll',
            },
            {
                type: others,
                path: 'very-long-filename12345678901234567890.dll',
            },
            {
                type: others,
                path: 'dir1/file.dll',
            },
            {
                type: others,
                path: 'dir1/dir2/file1.dll',
            },
            {
                type: others,
                path: 'dir1/dir2/file2.dll',
            },
        ],
    },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

const deleteSuccess = async () => {
    await delay(1000);
};

const deleteFail = async () => {
    await delay(1000);
    return Promise.reject();
};

export const ManyFiles = Template.bind({});
ManyFiles.args = {
    filesSource: undefined,
    files: [...Array(200)].map((_, i) => {
        const path = `file${(i + 1).toString().padStart(3, '0')}.dll`;
        return {
            key: path,
            type: others,
            onClick: () => undefined,
            onDelete: i % 2 === 0 ? deleteSuccess : deleteFail,
            path,
        };
    }),
};
