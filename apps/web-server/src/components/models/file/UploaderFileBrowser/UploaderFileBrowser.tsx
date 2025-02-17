import {
    State,
    filePathTemplate,
    joinPath,
    sanitizeFilename,
    sanitizeFoldername,
} from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { App, Modal, Upload, UploadProps } from 'antd';
import copy from 'clipboard-copy';
import { StorageReference, deleteObject, ref, uploadBytes } from 'firebase/storage';
import { useAtomValue } from 'jotai/react';
import { createStore } from 'jotai/vanilla';
import * as React from 'react';
import { useLatest } from 'react-use';
import urljoin from 'url-join';
import { useMutation, useQuery } from 'urql';
import useConstant from 'use-constant';
import { DeleteFilesDoc } from '../../../../graphql/DeleteFilesDoc';
import { GetFilesDoc } from '../../../../graphql/GetFilesDoc';
import { GetServerInfoDoc } from '../../../../graphql/GetServerInfoDoc';
import { RenameFilesDoc } from '../../../../graphql/RenameFilesDoc';
import { FileListType } from '../../../../graphql-codegen/graphql';
import { FileBrowser, FilePath } from '../FileBrowser/FileBrowser';
import { ImageView } from '../ImageView/ImageView';
import { accept } from './utils/helper';
import { getHttpUri } from '@/atoms/webConfigAtom/webConfigAtom';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { MockableWebConfig } from '@/configType';
import {
    FetchResult,
    File,
    appError,
    disabledByConfig,
    fetchError,
    fetching,
    mapFetchResult,
    success,
    useFirebaseStorageListAllQuery,
} from '@/hooks/useFirebaseStorageListAllQuery';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useOpenFirebaseStorageFile } from '@/hooks/useOpenFirebaseStorageFile';
import { useOpenFloconUploaderFile } from '@/hooks/useOpenFloconUploaderFile';
import { firebaseStorageAtom, firebaseUserAtom, getIdTokenResultAtom } from '@/hooks/useSetupApp';
import { useSingleExecuteAsync1 } from '@/hooks/useSingleExecuteAsync';
import { useWebConfig } from '@/hooks/useWebConfig';
import { $public, Path, StorageType, unlisted } from '@/utils/file/firebaseStorage';
import { thumbs } from '@/utils/file/getFloconUploaderFile';
import { FileType, guessFileType, image, others, sound } from '@/utils/fileType';
import { fileName } from '@/utils/filename';

type FilePathState = State<typeof filePathTemplate>;

type OnSelect = (filePath: FilePathState) => void;

const uploaderTypeFolderName = {
    publicFirebaseStorage: 'Firebase Storage(公開)',
    unlistedFirebaseStorage: 'Firebase Storage',
    publicApiServer: '内蔵アップローダー(公開)',
    unlistedApiServer: '内蔵アップローダー',
};

const draggerHeight = 150;

export type Reference = StorageReference;

export type FileState = {
    reference: Reference;
    fullPath: string;
    fileName: string;
    fileType: FileType;
    metadata: unknown;
};

const useFirebaseStorageFiles = (onSelect: OnSelect | null) => {
    const files = useFirebaseStorageListAllQuery();
    const onSelectRef = useLatest(onSelect);
    const { open } = useOpenFirebaseStorageFile();
    const isOnSelectNullish = onSelect == null;
    const { notification } = App.useApp();

    return React.useMemo(() => {
        const toFilePath =
            (type: StorageType) =>
            (file: File): FilePath => {
                const name = fileName(file.uploaderFilePath);
                const fileType = guessFileType(name);
                const fileBrowserPath = joinPath(
                    type === $public
                        ? uploaderTypeFolderName.publicFirebaseStorage
                        : uploaderTypeFolderName.unlistedFirebaseStorage,
                    file.uploaderFilePath,
                );
                const onClick = isOnSelectNullish
                    ? undefined
                    : () => {
                          if (onSelectRef.current == null) {
                              return;
                          }
                          onSelectRef.current({
                              $v: 1,
                              $r: 1,
                              sourceType: 'FirebaseStorage',
                              path: file.storageReference.fullPath,
                          });
                      };
                const result: FilePath = {
                    path: fileBrowserPath.array,
                    id: undefined,
                    icon: fileType,
                    fileType,
                    onDelete: async () => {
                        await deleteObject(file.storageReference);
                    },
                    onSelect: onClick,
                    onOpen: () => open?.(file.storageReference),
                    onClipboard: () => {
                        void copy(file.storageReference.fullPath).then(() => {
                            notification.success({
                                message: 'クリップボードにコピーしました。',
                                placement: 'bottomRight',
                            });
                        });
                    },
                    onMoveOrRename: () =>
                        Promise.reject(new Error('Not supported for Firebase Storage')),
                };
                return result;
            };

        const publicFiles = mapFetchResult(files.public, x => x.map(toFilePath($public)));
        const unlistedFiles = mapFetchResult(files.unlisted, x => x.map(toFilePath(unlisted)));
        return { public: publicFiles, unlisted: unlistedFiles };
    }, [files.public, files.unlisted, isOnSelectNullish, notification, onSelectRef, open]);
};

const useFloconUploaderFiles = (onSelect: OnSelect | null, pause: boolean) => {
    const [getFilesQueryResult] = useQuery({
        query: GetFilesDoc,
        variables: { input: { fileTagIds: [] } },
        pause,
    });
    const [, deleteFilesMutation] = useMutation(DeleteFilesDoc);
    const [, renameFilesMutation] = useMutation(RenameFilesDoc);
    const data = getFilesQueryResult.data?.result;
    const { open } = useOpenFloconUploaderFile();
    const onSelectRef = useLatest(onSelect);
    const isOnSelectNullish = onSelect == null;
    const { notification } = App.useApp();

    return React.useMemo(() => {
        if (data == null) {
            return null;
        }
        return data.files.map(file => {
            const name = fileName(file.filename);
            const fileType = guessFileType(name);
            const fileBrowserPath = joinPath(
                file.listType === FileListType.Public
                    ? uploaderTypeFolderName.publicApiServer
                    : uploaderTypeFolderName.unlistedApiServer,
                file.screenname,
            );
            const onClick = isOnSelectNullish
                ? undefined
                : () => {
                      if (onSelectRef.current == null) {
                          return;
                      }
                      onSelectRef.current({
                          $v: 1,
                          $r: 1,
                          sourceType: 'Uploader',
                          path: file.filename,
                      });
                  };
            const result: FilePath = {
                path: fileBrowserPath.array,
                id: undefined,
                icon: fileType,
                thumb:
                    fileType === image && file.thumbFilename != null ? (
                        <ImageView
                            size={60}
                            filePath={{ type: thumbs, thumbFilename: file.thumbFilename }}
                        />
                    ) : undefined,
                fileType,
                onDelete: async () => {
                    // CONSIDER: 複数のファイルを削除する場合、その数だけdeleteFilesMutationが実行されるので、API制限に引っかかる可能性がある。このコードかAPIサーバーのコードを見直す必要があるかもしれない。
                    await deleteFilesMutation({ filenames: file.filename });
                },
                onSelect: onClick,
                onOpen: () => open?.(file),
                onClipboard: () => {
                    void copy(file.filename).then(() => {
                        notification.success({
                            message: 'クリップボードにコピーしました。',
                            placement: 'bottomRight',
                        });
                    });
                },
                onMoveOrRename: async params => {
                    const newPath = [...params.newPath];
                    newPath.shift();
                    const newScreenname = joinPath(newPath).string;

                    // CONSIDER: 複数のファイルをrenameする場合、その数だけrenameFilesMutationが実行されるので、API制限に引っかかる可能性がある。このコードかAPIサーバーのコードを見直す必要があるかもしれない。
                    await renameFilesMutation({
                        input: { filename: file.filename, newScreenname },
                    });
                },
            };
            return result;
        });
    }, [
        data,
        deleteFilesMutation,
        isOnSelectNullish,
        notification,
        onSelectRef,
        open,
        renameFilesMutation,
    ]);
};

type UploaderProps = {
    onUploaded: () => void;
    storageType: StorageType;

    /** フォルダのパスを表します。ルートにある特殊フォルダや、ファイルの名前は含めないでください。 */
    folderPath: readonly string[];
};

const FirebaseStorageUploader: React.FC<UploaderProps> = ({
    onUploaded,
    storageType,
    folderPath,
}) => {
    const myUserUid = useMyUserUid();
    const config = useWebConfig();
    const storage = useAtomValue(firebaseStorageAtom);

    if (storageType === $public) {
        return (
            <span>
                {`${uploaderTypeFolderName.publicFirebaseStorage} は読み取り専用です。ファイルを設置するには、サーバー管理者がFirebase Storageで直接ファイルをアップロードします。`}
            </span>
        );
    }

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            height={draggerHeight}
            accept={accept}
            customRequest={options => {
                if (myUserUid == null || storage == null) {
                    return;
                }
                if (typeof options.file === 'string' || !('name' in options.file)) {
                    return;
                }
                const storageRef = (() => {
                    if (config.isUnlistedFirebaseStorageEnabled !== true) {
                        return null;
                    }
                    return ref(
                        storage,
                        Path.unlisted.file(myUserUid, joinPath(folderPath, options.file.name).array)
                            .string,
                    );
                })();
                if (storageRef == null) {
                    return;
                }
                uploadBytes(storageRef, options.file)
                    .then(() => {
                        if (options.onSuccess != null) {
                            options.onSuccess({}, new XMLHttpRequest());
                        }
                        onUploaded();
                    })
                    .catch((err: unknown) => {
                        if (options.onError != null) {
                            // CONSIDER: err が string になることはあるのだろうか？
                            if (typeof err === 'string') {
                                options.onError(new Error(err));
                                return;
                            }
                            if (err instanceof Error) {
                                options.onError(err);
                                return;
                            }
                        }
                    });
            }}
            multiple
        >
            アップロードしたいファイルをここにドラッグするか、クリックしてください
        </Upload.Dragger>
    );
};

type FloconUploaderProps = {
    onUploaded: () => void;
    storageType: StorageType;
    /** フォルダのパスを表します。ルートにある特殊フォルダや、ファイルの名前は含めないでください。 */
    folderPath: readonly string[];
    webConfig: MockableWebConfig;
};

const FloconUploader: React.FC<FloconUploaderProps> = ({
    onUploaded,
    storageType,
    folderPath,
    webConfig,
}) => {
    const { getIdToken } = useAtomValue(getIdTokenResultAtom);
    const { execute, isExecuting } = useSingleExecuteAsync1(
        async (options: Parameters<NonNullable<UploadProps<any>['customRequest']>>[0]) => {
            if (typeof options.file === 'string' || !('name' in options.file)) {
                return;
            }
            const idToken = await getIdToken();
            if (idToken == null) {
                return;
            }
            const formData = new FormData();
            formData.append('file', options.file, joinPath(folderPath, options.file.name).string);
            const result = await fetch(
                urljoin(
                    getHttpUri(webConfig),
                    'uploader',
                    'upload',
                    storageType === $public ? 'public' : 'unlisted',
                ),
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: formData,
                },
            )
                .then(() => true)
                .catch(
                    (
                        // CONSIDER: err が string になることはあるのだろうか？
                        err: string | Error,
                    ) => err,
                );

            if (result === true) {
                if (options.onSuccess != null) {
                    options.onSuccess({}, new XMLHttpRequest());
                }
                onUploaded();
            } else {
                if (options.onError != null) {
                    if (typeof result === 'string') {
                        options.onError(new Error(result));
                        return;
                    }
                    if (result instanceof Error) {
                        options.onError(result);
                    }
                }
            }
        },
    );

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            height={draggerHeight}
            accept={accept}
            disabled={isExecuting}
            customRequest={execute}
            multiple
        >
            アップロードしたいファイルをここにドラッグするか、クリックしてください
        </Upload.Dragger>
    );
};

type Props = {
    /** nullを渡した場合、ファイルを選択するメニュー等が無効化されます。 */
    onSelect: OnSelect | null;

    defaultFileTypeFilter: FileType | null;

    height: number | null;
};

export const UploaderFileBrowser: React.FC<Props> = ({
    onSelect,
    defaultFileTypeFilter,
    height,
}: Props) => {
    const [{ data: serverInfo }] = useQuery({ query: GetServerInfoDoc });
    /** `true` ならば enabled、`false` ならば disabled、nullish ならば判定中だということを示します。 */
    const isEmbeddedUploaderEnabled = serverInfo?.result.uploaderEnabled;
    const firebaseStorageFiles = useFirebaseStorageFiles(onSelect);
    const floconUploaderFiles = useFloconUploaderFiles(
        onSelect,
        isEmbeddedUploaderEnabled !== true,
    );
    const [firebaseStorageUploaderModalState, setFirebaseStorageUploaderModalState] =
        React.useState<{ storageType: StorageType; folderPath: readonly string[] }>();
    const [floconUploaderModalState, setFloconUploaderModalState] = React.useState<{
        storageType: StorageType;
        folderPath: readonly string[];
    }>();
    const { refetch: refetchFirebaseStorage } = useFirebaseStorageListAllQuery();
    const [, refetchFloconUploader] = useQuery({
        query: GetFilesDoc,
        variables: { input: { fileTagIds: [] } },
        pause: true,
    });
    const firebaseUser = useAtomValue(firebaseUserAtom);
    const webConfig = useWebConfig();

    const files = React.useMemo(() => {
        const result: FilePath[] = [];

        if (firebaseStorageFiles.public.type === success) {
            result.push(...firebaseStorageFiles.public.value);
        }
        if (firebaseStorageFiles.unlisted.type === success) {
            result.push(...firebaseStorageFiles.unlisted.value);
        }

        result.push(...(floconUploaderFiles ?? []));
        return result;
    }, [firebaseStorageFiles.public, firebaseStorageFiles.unlisted, floconUploaderFiles]);

    const overridingElements = React.useMemo(() => {
        const result: { path: string[]; element: JSX.Element }[] = [];

        const style: React.CSSProperties = { padding: 8 };

        if (typeof firebaseUser === 'string') {
            result.push({
                path: [],
                element: <div style={style}>アップローダーを使うにはログインが必要です。</div>,
            });
            return result;
        }

        const push = (source: FetchResult<FilePath[]>, path: string[]): void => {
            switch (source.type) {
                case appError: {
                    switch (source.error) {
                        case disabledByConfig:
                            result.push({
                                path,
                                element: (
                                    <div style={style}>
                                        管理者の設定によって無効化されています。
                                    </div>
                                ),
                            });
                            break;
                        default:
                            break;
                    }
                    break;
                }
                case fetching:
                    result.push({
                        path,
                        element: <div style={style}>読み込み中です…</div>,
                    });
                    break;
                case fetchError:
                    result.push({
                        path,
                        element: <div style={style}>エラー: {source.error.message}</div>,
                    });
                    break;
                case success:
                    break;
            }
        };

        push(firebaseStorageFiles.public, [uploaderTypeFolderName.publicFirebaseStorage]);
        push(firebaseStorageFiles.unlisted, [uploaderTypeFolderName.unlistedFirebaseStorage]);

        switch (isEmbeddedUploaderEnabled) {
            case null:
            case undefined: {
                result.push(
                    {
                        path: [uploaderTypeFolderName.publicApiServer],
                        element: (
                            <div style={style}>
                                内蔵アップローダーが有効かどうかを確認しています…
                            </div>
                        ),
                    },
                    {
                        path: [uploaderTypeFolderName.unlistedApiServer],
                        element: (
                            <div style={style}>
                                内蔵アップローダーが有効かどうかを確認しています…
                            </div>
                        ),
                    },
                );
                break;
            }
            case false: {
                result.push(
                    {
                        path: [uploaderTypeFolderName.publicApiServer],
                        element: <div style={style}>設定によって無効化されています。</div>,
                    },
                    {
                        path: [uploaderTypeFolderName.unlistedApiServer],
                        element: <div style={style}>設定によって無効化されています。</div>,
                    },
                );
                break;
            }
            case true: {
                if (floconUploaderFiles == null) {
                    result.push(
                        {
                            path: [uploaderTypeFolderName.publicApiServer],
                            element: <div style={style}>読み込み中です…</div>,
                        },
                        {
                            path: [uploaderTypeFolderName.unlistedApiServer],
                            element: <div style={style}>読み込み中です…</div>,
                        },
                    );
                }
            }
        }

        return result;
    }, [
        firebaseStorageFiles.public,
        firebaseStorageFiles.unlisted,
        firebaseUser,
        floconUploaderFiles,
        isEmbeddedUploaderEnabled,
    ]);

    const jotaiStore = useConstant(() => createStore());

    return (
        <>
            <FileBrowser
                jotaiStore={jotaiStore}
                height={height}
                fileCreateLabel="ファイルをアップロード"
                searchPlaceholder="ファイル名で検索"
                files={files}
                fileTypes={{
                    fileTypes: [
                        { fileType: image, name: '画像' },
                        { fileType: sound, name: '音声' },
                        { fileType: others, name: 'その他' },
                    ],
                    defaultFileTypeFilter,
                }}
                canMove={({ currentDirectoryPath, newDirectoryPath }) => {
                    switch (currentDirectoryPath[0]) {
                        case undefined:
                            return Result.error(
                                'このフォルダでは、フォルダの移動は無効化されています。',
                            );
                        case uploaderTypeFolderName.publicFirebaseStorage:
                        case uploaderTypeFolderName.unlistedFirebaseStorage:
                            return Result.error(
                                'Firebase Storage版アップローダーでは、ファイルの移動はサポートされていません。',
                            );
                        default:
                            break;
                    }
                    if (newDirectoryPath == null) {
                        return Result.ok(undefined);
                    }
                    if (newDirectoryPath.length === 0) {
                        return Result.error(
                            'このフォルダにファイル等を移動させることはできません。',
                        );
                    }
                    if (currentDirectoryPath[0] !== newDirectoryPath[0]) {
                        // 内蔵アップローダーのpublic↔unlisted間の移動は技術的には可能。ただし問題が起こらないかどうかについてはまだ未検証。
                        return Result.error(
                            '異なるアップローダー間の移動はサポートされていません。',
                        );
                    }
                    return Result.ok(undefined);
                }}
                canRename={({ directoryPath, newName, nodeType }) => {
                    switch (directoryPath[0]) {
                        case undefined:
                            return Result.error('このフォルダでは、リネームは無効化されています。');
                        case uploaderTypeFolderName.publicFirebaseStorage:
                        case uploaderTypeFolderName.unlistedFirebaseStorage:
                            return Result.error(
                                'Firebase Storage版アップローダーでは、ファイルやフォルダのリネームはサポートされていません。',
                            );
                        default:
                            break;
                    }
                    if (newName == null) {
                        return Result.ok(undefined);
                    }
                    if (newName === '') {
                        return Result.error('名前を空にすることはできません。');
                    }
                    if (nodeType === 'file') {
                        if (newName !== sanitizeFilename(newName)) {
                            return Result.error(
                                '名前が長すぎるか、使用できない文字が含まれています。',
                            );
                        }
                    } else {
                        if (newName !== sanitizeFoldername(newName)) {
                            return Result.error(
                                '名前が長すぎるか、使用できない文字が含まれています。',
                            );
                        }
                    }
                    if (newName.includes('/')) {
                        return Result.error('/ を含めることはできません。');
                    }
                    return Result.ok(undefined);
                }}
                canCreateFolder={({ foldername }) => {
                    if (foldername === '') {
                        return Result.error('フォルダ名を空白にすることはできません。');
                    }
                    if (foldername !== sanitizeFoldername(foldername)) {
                        return Result.error('名前が長すぎるか、使用できない文字が含まれています。');
                    }
                    return Result.ok(undefined);
                }}
                isProtected={absolutePath => absolutePath.length === 0}
                onFileCreate={absolutePath => {
                    const folderAbsolutePath = [...absolutePath];
                    const uploaderType = folderAbsolutePath.shift();
                    switch (uploaderType) {
                        case uploaderTypeFolderName.publicFirebaseStorage:
                            setFirebaseStorageUploaderModalState({
                                storageType: $public,
                                folderPath: folderAbsolutePath,
                            });
                            setFloconUploaderModalState(undefined);
                            break;
                        case uploaderTypeFolderName.unlistedFirebaseStorage:
                            setFirebaseStorageUploaderModalState({
                                storageType: unlisted,
                                folderPath: folderAbsolutePath,
                            });
                            setFloconUploaderModalState(undefined);
                            break;
                        case uploaderTypeFolderName.publicApiServer:
                            setFirebaseStorageUploaderModalState(undefined);
                            setFloconUploaderModalState({
                                storageType: $public,
                                folderPath: folderAbsolutePath,
                            });
                            break;
                        case uploaderTypeFolderName.unlistedApiServer:
                            setFirebaseStorageUploaderModalState(undefined);
                            setFloconUploaderModalState({
                                storageType: unlisted,
                                folderPath: folderAbsolutePath,
                            });
                            break;
                        default:
                            loggerRef.warn(`unknown uploaderType: ${uploaderType}`);
                            break;
                    }
                }}
                onDelete={deletedFiles => {
                    if (
                        deletedFiles.some(
                            file =>
                                file.path[0] === uploaderTypeFolderName.publicFirebaseStorage ||
                                file.path[0] === uploaderTypeFolderName.unlistedFirebaseStorage,
                        )
                    ) {
                        void refetchFirebaseStorage();
                    }
                    if (
                        deletedFiles.some(
                            file =>
                                file.path[0] === uploaderTypeFolderName.publicApiServer ||
                                file.path[0] === uploaderTypeFolderName.unlistedApiServer,
                        )
                    ) {
                        refetchFloconUploader({ requestPolicy: 'network-only' });
                    }
                }}
                onRename={renamedFiles => {
                    if (
                        renamedFiles.some(
                            file =>
                                file.currentPath[0] ===
                                    uploaderTypeFolderName.publicFirebaseStorage ||
                                file.currentPath[0] ===
                                    uploaderTypeFolderName.unlistedFirebaseStorage,
                        )
                    ) {
                        void refetchFirebaseStorage();
                    }
                    if (
                        renamedFiles.some(
                            file =>
                                file.currentPath[0] === uploaderTypeFolderName.publicApiServer ||
                                file.currentPath[0] === uploaderTypeFolderName.unlistedApiServer,
                        )
                    ) {
                        refetchFloconUploader({ requestPolicy: 'network-only' });
                    }
                }}
                ensuredFolderPaths={[
                    {
                        path: [uploaderTypeFolderName.publicFirebaseStorage],
                    },
                    {
                        path: [uploaderTypeFolderName.unlistedFirebaseStorage],
                    },
                    {
                        path: [uploaderTypeFolderName.publicApiServer],
                    },
                    {
                        path: [uploaderTypeFolderName.unlistedApiServer],
                    },
                ]}
                overridingElements={overridingElements}
            />
            {firebaseStorageUploaderModalState && (
                <Modal
                    title="ファイルのアップロード"
                    open
                    onCancel={() => setFirebaseStorageUploaderModalState(undefined)}
                    footer={
                        <DialogFooter
                            close={{
                                textType: 'close',
                                onClick: () => setFirebaseStorageUploaderModalState(undefined),
                            }}
                        />
                    }
                >
                    <FirebaseStorageUploader
                        storageType={firebaseStorageUploaderModalState.storageType}
                        onUploaded={() => {
                            setFirebaseStorageUploaderModalState(undefined);
                            void refetchFirebaseStorage();
                        }}
                        folderPath={firebaseStorageUploaderModalState.folderPath}
                    />
                </Modal>
            )}
            {floconUploaderModalState && webConfig != null && (
                <Modal
                    title="ファイルのアップロード"
                    open
                    onCancel={() => setFloconUploaderModalState(undefined)}
                    footer={
                        <DialogFooter
                            close={{
                                textType: 'close',
                                onClick: () => setFloconUploaderModalState(undefined),
                            }}
                        />
                    }
                >
                    <FloconUploader
                        storageType={floconUploaderModalState.storageType}
                        onUploaded={() => {
                            setFloconUploaderModalState(undefined);
                            refetchFloconUploader({ requestPolicy: 'network-only' });
                        }}
                        folderPath={floconUploaderModalState.folderPath}
                        webConfig={webConfig}
                    />
                </Modal>
            )}
        </>
    );
};
