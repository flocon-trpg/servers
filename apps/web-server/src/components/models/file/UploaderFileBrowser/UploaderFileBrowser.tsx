import * as React from 'react';
import { Modal, Upload, notification } from 'antd';
import {
    DeleteFilesDocument,
    FileListType,
    GetFilesDocument,
    GetServerInfoDocument,
} from '@flocon-trpg/typed-document-node-v0.7.8';
import { useMutation, useQuery } from 'urql';
import { useAtomValue } from 'jotai';
import { firebaseStorageAtom } from '@/pages/_app';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { StorageReference, deleteObject, ref, uploadBytes } from 'firebase/storage';
import { FileType, guessFileType, image, others, sound } from '@/utils/fileType';
import { useWebConfig } from '@/hooks/useWebConfig';
import { FileBrowser, FilePath } from '../FileBrowser/FileBrowser';
import { fileName } from '@/utils/filename';
import { File, useFirebaseStorageListAllQuery } from '@/hooks/useFirebaseStorageListAllQuery';
import { useGetIdToken } from '@/hooks/useGetIdToken';
import { $public, Path, StorageType, unlisted } from '@/utils/file/firebaseStorage';
import { accept } from './utils/helper';
import {
    State,
    filePathTemplate,
    joinPath,
    sanitizeFilename,
    sanitizeFoldername,
} from '@flocon-trpg/core';
import urljoin from 'url-join';
import { getHttpUri } from '@/atoms/webConfigAtom/webConfigAtom';
import axios from 'axios';
import { useLatest } from 'react-use';
import copy from 'clipboard-copy';
import { useOpenFirebaseStorageFile } from '@/hooks/useOpenFirebaseStorageFile';
import { useOpenFloconUploaderFile } from '@/hooks/useOpenFloconUploaderFile';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Result } from '@kizahasi/result';

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
                    file.uploaderFilePath
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
                    onOpen: () => open(file.storageReference),
                    onClipboard: () => {
                        copy(file.storageReference.fullPath).then(() => {
                            notification.success({
                                message: 'クリップボードにコピーしました。',
                                placement: 'bottomRight',
                            });
                        });
                    },
                    onMoveOrRename: () => Promise.reject('not supported'),
                };
                return result;
            };

        const publicFiles = Array.isArray(files.public)
            ? files.public.map(toFilePath($public))
            : files.public;
        const unlistedFiles = Array.isArray(files.unlisted)
            ? files.unlisted.map(toFilePath(unlisted))
            : files.unlisted;
        return { public: publicFiles, unlisted: unlistedFiles };
    }, [files, isOnSelectNullish, onSelectRef, open]);
};

const useFloconUploaderFiles = (onSelect: OnSelect | null, pause: boolean) => {
    const [getFilesQueryResult] = useQuery({
        query: GetFilesDocument,
        variables: { input: { fileTagIds: [] } },
        pause,
    });
    const [, deleteFilesMutation] = useMutation(DeleteFilesDocument);
    const data = getFilesQueryResult.data?.result;
    const { open } = useOpenFloconUploaderFile();
    const onSelectRef = useLatest(onSelect);
    const isOnSelectNullish = onSelect == null;

    return React.useMemo(() => {
        if (data == null) {
            return null;
        }
        return data.files.map(file => {
            const name = fileName(file.screenname);
            const fileType = guessFileType(name);
            const fileBrowserPath = joinPath(
                file.listType === FileListType.Public
                    ? uploaderTypeFolderName.publicApiServer
                    : uploaderTypeFolderName.unlistedApiServer,
                file.screenname
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
                fileType,
                onDelete: async () => {
                    // CONSIDER: 複数のファイルを削除する場合、その数だけdeleteFilesMutationが実行されるので、API制限に引っかかる可能性がある。このコードかAPIサーバーのコードを見直す必要があるかもしれない。
                    await deleteFilesMutation({ filenames: file.filename });
                },
                onSelect: onClick,
                onOpen: async () => open(file),
                onClipboard: () => {
                    copy(file.filename).then(() => {
                        notification.success({
                            message: 'クリップボードにコピーしました。',
                            placement: 'bottomRight',
                        });
                    });
                },
                onMoveOrRename: async () => {
                    // TODO: 実装する
                    notification.warn({ message: '移動とリネームは未実装です。' });
                },
            };
            return result;
        });
    }, [data, deleteFilesMutation, isOnSelectNullish, onSelectRef, open]);
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
                if (myUserUid == null || config?.value == null || storage == null) {
                    return;
                }
                if (typeof options.file === 'string' || !('name' in options.file)) {
                    return;
                }
                const storageRef = (() => {
                    if (config.value.isUnlistedFirebaseStorageEnabled !== true) {
                        return null;
                    }
                    return ref(
                        storage,
                        Path.unlisted.file(myUserUid, joinPath(folderPath, options.file.name).array)
                            .string
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
                    .catch(err => {
                        if (options.onError != null) {
                            if (typeof err === 'string') {
                                options.onError(new Error(err));
                                return;
                            }
                            options.onError(err);
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
};

const FloconUploader: React.FC<FloconUploaderProps> = ({ onUploaded, storageType, folderPath }) => {
    const config = useWebConfig();
    const { getIdToken } = useGetIdToken();

    if (config?.value == null || getIdToken == null) {
        return null;
    }

    // TODO: antdのUploaderでアップロードが完了したとき、そのログを消すメッセージが「remove file」でアイコンがゴミ箱なのは紛らわしいと思うので直したい。
    // TODO: 同一ファイル名のファイルをアップロードすると上書きされるので、そのときは失敗させるかダイアログを出したほうが親切か。
    return (
        <Upload.Dragger
            height={draggerHeight}
            accept={accept}
            customRequest={options => {
                const main = async () => {
                    if (typeof options.file === 'string' || !('name' in options.file)) {
                        return;
                    }
                    const idToken = await getIdToken();
                    if (idToken == null) {
                        return;
                    }
                    const formData = new FormData();
                    formData.append(
                        'file',
                        options.file,
                        joinPath(folderPath, options.file.name).string
                    );
                    const axiosConfig = {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    };
                    const result = await axios
                        .post(
                            urljoin(
                                getHttpUri(config.value),
                                'uploader',
                                'upload',
                                storageType === $public ? 'public' : 'unlisted'
                            ),
                            formData,
                            axiosConfig
                        )
                        .then(() => true)
                        .catch(err => err);

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
                            options.onError(result);
                        }
                    }
                };
                main();
            }}
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
    const [{ data: serverInfo }] = useQuery({ query: GetServerInfoDocument });
    const isEmbeddedUploaderDisabled = serverInfo?.result.uploaderEnabled !== true;
    const firebaseStorageFiles = useFirebaseStorageFiles(onSelect);
    const floconUploaderFiles = useFloconUploaderFiles(onSelect, isEmbeddedUploaderDisabled);
    const [firebaseStorageUploaderModalState, setFirebaseStorageUploaderModalState] =
        React.useState<{ storageType: StorageType; folderPath: readonly string[] }>();
    const [floconUploaderModalState, setFloconUploaderModalState] = React.useState<{
        storageType: StorageType;
        folderPath: readonly string[];
    }>();

    const files = React.useMemo(() => {
        const result: FilePath[] = [];

        // CONSIDER: firebaseStorageFiles.(public|unlisted) がエラーだった時にFileBrowserなどで通知されたほうがわかりやすい
        if (
            firebaseStorageFiles.public != null &&
            typeof firebaseStorageFiles.public !== 'string'
        ) {
            result.push(...(firebaseStorageFiles.public ?? []));
        }
        if (
            firebaseStorageFiles.unlisted != null &&
            typeof firebaseStorageFiles.unlisted !== 'string'
        ) {
            result.push(...(firebaseStorageFiles.unlisted ?? []));
        }

        result.push(...(floconUploaderFiles ?? []));
        return result;
    }, [firebaseStorageFiles.public, firebaseStorageFiles.unlisted, floconUploaderFiles]);

    return (
        <>
            <FileBrowser
                height={height}
                fileCreateLabel='ファイルをアップロード'
                searchPlaceholder='ファイル名で検索'
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
                                'このフォルダでは、フォルダの移動は無効化されています。'
                            );
                        case uploaderTypeFolderName.publicFirebaseStorage:
                        case uploaderTypeFolderName.unlistedFirebaseStorage:
                            return Result.error(
                                'Firebase Storage版アップローダーでは、ファイルの移動はサポートされていません。'
                            );
                        default:
                            break;
                    }
                    if (newDirectoryPath == null) {
                        return Result.ok(undefined);
                    }
                    if (newDirectoryPath.length === 0) {
                        return Result.error(
                            'このフォルダにファイル等を移動させることはできません。'
                        );
                    }
                    if (currentDirectoryPath[0] !== newDirectoryPath[0]) {
                        // 内蔵アップローダーのpublic↔unlisted間の移動は技術的には可能。ただし問題が起こらないかどうかについてはまだ未検証。
                        return Result.error(
                            '異なるアップローダー間の移動はサポートされていません。'
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
                                'Firebase Storage版アップローダーでは、ファイルやフォルダのリネームはサポートされていません。'
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
                                '名前が長すぎるか、使用できない文字が含まれています。'
                            );
                        }
                    } else {
                        if (newName !== sanitizeFoldername(newName)) {
                            return Result.error(
                                '名前が長すぎるか、使用できない文字が含まれています。'
                            );
                        }
                    }
                    if (newName.includes('/')) {
                        return Result.error('/ を含めることはできません。');
                    }
                    return Result.ok(undefined);
                }}
                canCreateTempVirtualFolder={({ foldername }) => {
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
                            console.warn('unknown uploaderType:', uploaderType);
                            break;
                    }
                }}
                ensuredVirtualFolderPaths={[
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
            />
            {firebaseStorageUploaderModalState && (
                <Modal
                    title='ファイルのアップロード'
                    visible
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
                        onUploaded={() => setFirebaseStorageUploaderModalState(undefined)}
                        folderPath={firebaseStorageUploaderModalState.folderPath}
                    />
                </Modal>
            )}
            {floconUploaderModalState && (
                <Modal
                    title='ファイルのアップロード'
                    visible
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
                        onUploaded={() => setFloconUploaderModalState(undefined)}
                        folderPath={floconUploaderModalState.folderPath}
                    />
                </Modal>
            )}
        </>
    );
};
