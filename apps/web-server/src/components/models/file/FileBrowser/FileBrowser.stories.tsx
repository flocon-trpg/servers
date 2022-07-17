import { joinPath } from '@flocon-trpg/core';
import { both, delay, groupJoinArray } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import {
    FileBrowser,
    Props as FileBrowserProps,
    FilePath,
    image,
    others,
    sound,
    text,
} from './FileBrowser';

type FileSource =
    | {
          type: typeof sound | typeof others;
          path: readonly string[];
      }
    | {
          type: typeof image;
          path: readonly string[];
          thumb?: React.ReactNode;
      };

const arrayEquals = (x: readonly string[], y: readonly string[]): boolean => {
    for (const group of groupJoinArray(x, y)) {
        if (group.type !== both) {
            return false;
        }
        if (group.left !== group.right) {
            return false;
        }
    }
    return true;
};

type PracticalProps = {
    filesSource: FileSource[];
    defaultFileTypeFilter: string | null;
};

const toFilePath = (filesSourceRef: { current: FileSource[] }): FilePath[] => {
    return filesSourceRef.current.map((file): FilePath => {
        const onClick = () => console.log('clicked', file.path);
        const onDelete = async () => {
            await delay(1000);
            if (file.type !== others) {
                return Promise.reject(new Error('fake error'));
            }
            filesSourceRef.current = filesSourceRef.current.filter(x =>
                arrayEquals(x.path, file.path)
            );
        };
        const onOpen = () => console.log('open', file.path);
        const onClipboard = () => console.log('clipboard', file.path);
        if (file.type === image) {
            return {
                fileType: file.type,
                path: file.path,
                key: joinPath(file.path).string,
                onSelect: onClick,
                onDelete,
                onOpen,
                onClipboard,
                thumb: file.thumb,
            };
        }
        return {
            fileType: file.type,
            path: file.path,
            key: joinPath(file.path).string,
            onSelect: onClick,
            onDelete,
            onOpen,
            onClipboard,
            icon: file.type,
        };
    });
};

const Practical: React.FC<PracticalProps> = ({
    filesSource,
    defaultFileTypeFilter,
}: PracticalProps) => {
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
            height={null}
            files={filesState}
            onDelete={() => {
                setFilesState(toFilePath(filesSourceRef));
            }}
            fileTypes={{
                defaultFileTypeFilter,
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
            isLocked={() => false}
            onFileCreate={() => Promise.resolve(true)}
            // TODO: ensuredFolderPathsを用いたstoryも作成する
            ensuredFolderPaths={[]}
        />
    );
};

type Props = {
    files?: FileBrowserProps['files'] | undefined;
    filesSource?: FileSource[];
    defaultFileTypeFilter?: string | null;
};

export const Default: React.FC<Props> = ({ files, filesSource, defaultFileTypeFilter }) => {
    if (files == null) {
        if (filesSource == null) {
            throw new Error();
        }
        return (
            <Practical
                filesSource={filesSource}
                defaultFileTypeFilter={defaultFileTypeFilter ?? null}
            />
        );
    }

    if (filesSource != null) {
        throw new Error();
    }

    return (
        <FileBrowser
            height={null}
            files={files}
            isLocked={() => false}
            onFileCreate={() => Promise.resolve(true)}
            ensuredFolderPaths={[]}
        />
    );
};

export default {
    title: 'models/file/FileBrowser',
    component: Default,
    args: {
        filesSource: [
            {
                type: image,
                path: ['image1.png'],
            },
            {
                type: image,
                path: ['image2.png'],
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/100x100/fff/000'
                    />
                ),
            },
            {
                type: image,
                path: ['image3.png'],
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/200x100/fff/000'
                    />
                ),
            },
            {
                type: image,
                path: ['image4.png'],
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src='https://dummyimage.com/100x200/fff/000'
                    />
                ),
            },
            {
                type: sound,
                path: ['sound.mp3'],
            },
            {
                type: others,
                path: ['others.dll'],
            },
            {
                type: others,
                path: ['long-filename-123456.dll'],
            },
            {
                type: others,
                path: ['very-long-filename12345678901234567890.dll'],
            },
            {
                type: others,
                path: ['dir1', 'file.dll'],
            },
            {
                type: others,
                path: ['dir1', 'dir2', 'file1.dll'],
            },
            {
                type: others,
                path: ['dir1', 'dir2', 'file2.dll'],
            },
        ],
    },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Filtered = Template.bind({});
Filtered.args = {
    defaultFileTypeFilter: others,
};

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
        const filename = `file${(i + 1).toString().padStart(3, '0')}.dll`;
        return {
            key: filename,
            type: others,
            onDelete: i % 2 === 0 ? deleteSuccess : deleteFail,
            path: [filename],
        };
    }),
};

export const DuplicatedName = Template.bind({});
DuplicatedName.args = {
    filesSource: undefined,
    files: [
        {
            key: 'file.txt(1)',
            path: ['file.txt'],
            icon: text,
            onDelete: deleteSuccess,
            onSelect: () => console.log('file.txt(1)'),
        },
        {
            key: 'file.txt(2)',
            path: ['file.txt'],
            icon: text,
            onDelete: deleteSuccess,
            onSelect: () => console.log('file.txt(2)'),
        },
        {
            key: 'folder/image.png(1)',
            path: ['folder/image.png'],
            icon: image,
            onDelete: deleteSuccess,
            onSelect: () => console.log('folder/image.png(1)'),
        },
        {
            key: 'folder/image.png(2)',
            path: ['folder/image.png'],
            icon: image,
            onDelete: deleteSuccess,
            onSelect: () => console.log('folder/image.png(2)'),
        },
    ],
};
