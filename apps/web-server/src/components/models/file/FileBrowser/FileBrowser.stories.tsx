import { both, delay, groupJoinArray, loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { createStore } from 'jotai/vanilla';
import React from 'react';
import useConstant from 'use-constant';
import {
    FileBrowser,
    Props as FileBrowserProps,
    FilePath,
    image,
    others,
    sound,
} from './FileBrowser';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { Meta, StoryObj } from '@storybook/react';

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
    ensuredFolderPaths: FileBrowserProps['ensuredFolderPaths'];
};

const toFilePath = (filesSourceRef: { current: FileSource[] }): FilePath[] => {
    return filesSourceRef.current.map((file): FilePath => {
        const onClick = () => loggerRef.info({ file }, 'clicked');
        const onDelete = async () => {
            await delay(1000);
            if (file.type !== others) {
                return Promise.reject(new Error('fake error'));
            }
            filesSourceRef.current = filesSourceRef.current.filter(elem =>
                arrayEquals(elem.path, file.path),
            );
        };
        const onOpen = () => loggerRef.info({ file }, 'open');
        const onClipboard = () => loggerRef.info({ file }, 'clipboard');
        const onMoveOrRename: FilePath['onMoveOrRename'] = async params => {
            await delay(1000);
            if (file.type !== others) {
                return Promise.reject(new Error('fake error'));
            }
            filesSourceRef.current = filesSourceRef.current.map(elem => {
                if (arrayEquals(elem.path, params.currentPath)) {
                    return {
                        ...elem,
                        path: params.newPath,
                    };
                }
                return elem;
            });
        };
        if (file.type === image) {
            return {
                fileType: file.type,
                path: file.path,
                onSelect: onClick,
                onDelete,
                onOpen,
                onClipboard,
                onMoveOrRename,
                thumb: file.thumb,
                id: undefined,
            };
        }
        return {
            fileType: file.type,
            path: file.path,
            onSelect: onClick,
            onDelete,
            onOpen,
            onClipboard,
            onMoveOrRename,
            icon: file.type,
            id: undefined,
        };
    });
};

const Practical: React.FC<PracticalProps> = ({
    filesSource,
    defaultFileTypeFilter,
    ensuredFolderPaths,
}: PracticalProps) => {
    const filesSourceRef = React.useRef(filesSource);
    React.useEffect(() => {
        filesSourceRef.current = filesSource;
    }, [filesSource]);
    const [filesState, setFilesState] = React.useState<FilePath[]>([]);
    React.useEffect(() => {
        setFilesState(toFilePath(filesSourceRef));
    }, []);
    const jotaiStore = useConstant(() => createStore());

    return (
        <StorybookProvider compact roomClientContextValue={null}>
            <FileBrowser
                jotaiStore={jotaiStore}
                height={null}
                files={filesState}
                fileCreateLabel="😀ファイルを作成🤖"
                searchPlaceholder="😀検索🤖"
                onDelete={() => {
                    setFilesState(toFilePath(filesSourceRef));
                }}
                onRename={() => {
                    setFilesState(toFilePath(filesSourceRef));
                }}
                onFileCreate={() => {
                    setFilesState(toFilePath(filesSourceRef));
                }}
                // TODO: canMoveを用いたstoryも作成する
                canMove={() => Result.ok(undefined)}
                // TODO: canRenameを用いたstoryも作成する
                canRename={() => Result.ok(undefined)}
                canCreateFolder={({ foldername }) => {
                    if (foldername === '') {
                        return Result.error('empty foldername');
                    }
                    if (foldername.includes('/')) {
                        return Result.error('includes /');
                    }
                    return Result.ok(undefined);
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
                isProtected={() => false}
                ensuredFolderPaths={ensuredFolderPaths}
                // TODO: overridingElementsを用いたstoryも作成する
                overridingElements={[]}
            />
        </StorybookProvider>
    );
};

type Props = {
    files?: FileBrowserProps['files'] | undefined;
    filesSource?: FileSource[];
    defaultFileTypeFilter?: string | null;
    ensuredFolderPaths: FileBrowserProps['ensuredFolderPaths'];
};

export const Default: React.FC<Props> = ({
    files,
    filesSource,
    defaultFileTypeFilter,
    ensuredFolderPaths,
}) => {
    const jotaiStore = useConstant(() => createStore());

    if (files == null) {
        if (filesSource == null) {
            throw new Error();
        }
        return (
            <Practical
                filesSource={filesSource}
                defaultFileTypeFilter={defaultFileTypeFilter ?? null}
                ensuredFolderPaths={ensuredFolderPaths}
            />
        );
    }

    if (filesSource != null) {
        throw new Error();
    }

    return (
        <StorybookProvider compact roomClientContextValue={null}>
            <FileBrowser
                jotaiStore={jotaiStore}
                height={null}
                fileCreateLabel="😀ファイルを作成🤖"
                searchPlaceholder="😀検索🤖"
                files={files}
                isProtected={() => false}
                ensuredFolderPaths={ensuredFolderPaths}
                overridingElements={[]}
                canMove={() => Result.error('fake error')}
                canRename={() => Result.error('fake error')}
                canCreateFolder={() => Result.error('fake error')}
            />
        </StorybookProvider>
    );
};

const meta = {
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
                        src="https://dummyimage.com/100x100/fff/000"
                    />
                ),
            },
            {
                type: image,
                path: ['image3.png'],
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src="https://dummyimage.com/200x100/fff/000"
                    />
                ),
            },
            {
                type: image,
                path: ['image4.png'],
                thumb: (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src="https://dummyimage.com/100x200/fff/000"
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
                path: ['dir1-1', 'file.dll'],
            },
            {
                type: others,
                path: ['dir1-1', 'dir1-2', 'file1.dll'],
            },
            {
                type: others,
                path: ['dir1-1', 'dir1-2', 'file2.dll'],
            },
            {
                type: others,
                path: ['dir2-1', 'dir2-2', 'file3.dll'],
            },
        ],
        ensuredFolderPaths: [
            { path: ['ensured-folder-1'] },
            {
                path: ['ensured-folder-2', 'ensured-folder-2_1'],
            },
            {
                path: ['ensured-folder-2', 'ensured-folder-2_2'],
            },
        ],
    },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filtered: Story = {
    args: {
        defaultFileTypeFilter: others,
    },
};

export const Empty: Story = {
    args: {
        filesSource: undefined,
        files: [],
        ensuredFolderPaths: [],
    },
};

export const EmptyButEnsured: Story = {
    args: {
        filesSource: undefined,
        files: [],
    },
};

const success = async () => {
    await delay(1000);
};

const fail = async () => {
    await delay(1000);
    return Promise.reject(new Error('(Fake error)'));
};

export const ManyFiles: Story = {
    args: {
        filesSource: undefined,
        files: [...Array(200).keys()].map(i => {
            const filename = `file${(i + 1).toString().padStart(3, '0')}.dll`;
            return {
                key: filename,
                type: others,
                onDelete: i % 2 === 0 ? success : fail,
                onMoveOrRename: i % 2 === 0 ? success : fail,
                path: [filename],
                id: undefined,
            };
        }),
    },
};
