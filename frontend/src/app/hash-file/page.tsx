"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { BufferCrypto } from '@/lib/blockchain';
import { toast } from 'react-toastify';

const getMimeType = (arr: Uint8Array): string => {
    const header = arr.slice(0, 4).reduce((acc, byte) => acc + byte.toString(16), '');
    switch (header) {
        case '89504e47': return 'image/png';
        case '47494638': return 'image/gif';
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2': return 'image/jpeg';
        case '25504446': return 'application/pdf';
        default: return 'text/plain';
    }
};

const FileCryptographyTool = () => {
    const [activeTab, setActiveTab] = useState('hash');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [encodedFile, setEncodedFile] = useState<Buffer | null>(null);
    const [hashResult, setHashResult] = useState<string | null>(null);
    const [encryptedData, setEncryptedData] = useState<{
        encrypted: string,
        iv: string,
        key: string
    } | null>(null);

    const [inputDecrypt, setInputDecrypt] = useState<{
        encrypted: string,
        iv: string,
        key: string
    }>({ encrypted: "", iv: "", key: "" })

    const [decryptedData, setDecryptedData] = useState<Buffer | null>(null);

    const [bufferCrypto, setBufferCrypto] = useState(new BufferCrypto());
    const [showKeyForm, setShowKeyForm] = useState(false);
    const [formKey, setFromKey] = useState("")
    const [formIV, setFromIV] = useState("")
    const [showPublicKeyForm, setShowPublicKeyForm] = useState(false);

    const handlerChangeKey = () => {
        setBufferCrypto(new BufferCrypto("aes-256-cbc", formKey, formIV))
        toast.success("Lưu key mới thành công")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Reset previous results
        setHashResult(null);
        setEncryptedData(null);
        setDecryptedData(null);

        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                if (file.type.startsWith("image/")) {
                    setFilePreview(e.target.result as string);
                } else {
                    setFilePreview(null);
                }
                setEncodedFile(Buffer.from(e.target.result as ArrayBuffer));
            }
        };

        reader.readAsArrayBuffer(file);

        if (file.type.startsWith("image/")) {
            const imgReader = new FileReader();
            imgReader.onload = (e) => setFilePreview(e.target?.result as string);
            imgReader.readAsDataURL(file);
        }
    };


    const handleHashFile = async () => {
        if (!encodedFile) return;

        try {
            const hashValue = bufferCrypto.hash(encodedFile);
            setHashResult(hashValue);
        } catch (error) {
            console.error('Error hashing file:', error);
            setHashResult('Lỗi khi tạo giá trị băm');
        }
    };


    const handleEncryptFile = () => {
        if (!encodedFile) return;

        try {

            // Mã hóa dữ liệu và lưu dưới dạng base64
            const encryptedBase64 = bufferCrypto.encryptToBase64(encodedFile);

            // Lưu key và iv để giải mã sau này
            setEncryptedData({
                encrypted: encryptedBase64,
                iv: bufferCrypto.getIvAsHex(),
                key: bufferCrypto.getKeyAsHex()
            });
            setFromIV(bufferCrypto.getIvAsHex())
            setFromKey(bufferCrypto.getKeyAsHex())
        } catch (error) {
            console.error('Error encrypting file:', error);
            alert('Lỗi khi mã hóa file');
        }
    };


    const handleDecryptFile = () => {
        if (!inputDecrypt) return;
    
        try {
            const cryptoInstance = new BufferCrypto(
                'aes-256-cbc',
                inputDecrypt.key,
                inputDecrypt.iv
            );
    
            const decrypted = cryptoInstance.decryptFromBase64(inputDecrypt.encrypted);
    
            setDecryptedData(decrypted);
    
            const blob = new Blob([decrypted]);
    
            const imageUrl = URL.createObjectURL(blob);

            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                const arr = new Uint8Array(fileReader.result as ArrayBuffer);
                const type = getMimeType(arr);

                if (type.startsWith('image/')) {
                    setFilePreview(imageUrl);
                } else if (type === 'text/plain') {
                    const textDecoder = new TextDecoder();
                    console.log('Decrypted text:', textDecoder.decode(decrypted));
                }
            };

            fileReader.readAsArrayBuffer(blob)
        } catch (error) {
            console.error('Error decrypting file:', error);
            alert('Lỗi khi giải mã file');
        }
    };
    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Công cụ Mã hóa và Xác thực File</h1>

            {/* Tab navigation cải tiến */}
            <div className="mb-6">
                <div className="flex flex-wrap md:flex-nowrap overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <button
                        className={`flex-1 py-3 px-4 font-medium text-center transition-all duration-200 ${activeTab === 'hash'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('hash')}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Tạo giá trị băm
                        </span>
                    </button>

                    <button
                        className={`flex-1 py-3 px-4 font-medium text-center transition-all duration-200 ${activeTab === 'encrypt'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('encrypt')}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Mã hóa dữ liệu
                        </span>
                    </button>

                    <button
                        className={`flex-1 py-3 px-4 font-medium text-center transition-all duration-200 ${activeTab === 'decrypt'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('decrypt')}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Giải mã dữ liệu
                        </span>
                    </button>

                    <button
                        className={`flex-1 py-3 px-4 font-medium text-center transition-all duration-200 ${activeTab === 'sign'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('sign')}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Tạo chữ ký số
                        </span>
                    </button>

                    <button
                        className={`flex-1 py-3 px-4 font-medium text-center transition-all duration-200 ${activeTab === 'verify'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('verify')}
                    >
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Xác minh chữ ký số
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                            </svg>
                            <h2 className="text-lg font-semibold">Chọn File</h2>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại file hỗ trợ: JPG, PNG, PDF, TXT...
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="sr-only"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    {selectedFile ? selectedFile.name : "Chọn hoặc kéo thả file vào đây"}
                                </label>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin file</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                        <p className="text-sm mb-1 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium mr-1">Tên:</span> {selectedFile.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm mb-1 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <span className="font-medium mr-1">Loại:</span> {selectedFile.type || "Không xác định"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm mb-1 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                            </svg>
                                            <span className="font-medium mr-1">Kích thước:</span> {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filePreview && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Xem trước
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {typeof filePreview === 'string' && (
                                        <Image
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-full h-auto"
                                            layout="responsive"
                                            width={500}
                                            height={500}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex flex-col space-y-2">
                            <button
                                onClick={() => setShowKeyForm(true)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Nhập Key & IV
                            </button>
                            <button
                                onClick={() => setShowPublicKeyForm(true)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Xem Public/Private Key
                            </button>
                        </div>
                    </div>

                    {showKeyForm && (
                        <div className="mt-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    Nhập Key & IV
                                </h3>
                                <button
                                    onClick={() => setShowKeyForm(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                                    <input
                                        type="text"
                                        value={formKey}
                                        onChange={e => setFromKey(e.target.value)}
                                        placeholder="Nhập Key (hex)"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">IV</label>
                                    <input
                                        type="text"
                                        value={formIV}
                                        onChange={e => setFromIV(e.target.value)}
                                        placeholder="Nhập IV (hex)"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <button
                                    onClick={handlerChangeKey}
                                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                    {showPublicKeyForm && (
                        <div className="mt-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Public/Private Key
                                </h3>
                                <button
                                    onClick={() => setShowPublicKeyForm(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                                    <textarea
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                        rows={3}
                                        value={"Chưa có public key"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Private Key</label>
                                    <textarea
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                        rows={3}
                                        value={"Chưa có private key"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        {activeTab === 'hash' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Tạo giá trị băm (Hash)</h2>
                                <button
                                    className={`py-2 px-4 rounded text-white font-medium ${selectedFile ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                                    disabled={!selectedFile}
                                    onClick={handleHashFile}
                                >
                                    Tạo giá trị băm
                                </button>
                                {hashResult && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-medium mb-2">Kết quả:</h3>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <p className="font-mono text-sm break-all">{hashResult}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'encrypt' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Mã hóa dữ liệu</h2>
                                <button className={`py-2 px-4 rounded text-white font-medium ${selectedFile ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`} disabled={!selectedFile} onClick={handleEncryptFile}>Mã hóa</button>
                                {encryptedData && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-medium mb-2">Dữ liệu đã mã hóa:</h3>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <p className="font-mono text-sm break-all">{encryptedData.encrypted}</p>
                                            <p className="mt-2 text-sm"><strong>Key:</strong> {encryptedData.key}</p>
                                            <p className="text-sm"><strong>IV:</strong> {encryptedData.iv}</p>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">Lưu ý: Hãy lưu lại Key và IV để giải mã sau này</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'decrypt' && (
                            <div className="p-4 bg-white rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-6 text-gray-800">Giải mã dữ liệu</h2>

                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-1">Dữ liệu đã mã hóa</label>
                                        <textarea
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={inputDecrypt.encrypted}
                                            onChange={(e) => setInputDecrypt({ ...inputDecrypt, encrypted: e.target.value })}
                                            placeholder="Nhập dữ liệu đã mã hóa"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Key</label>
                                            <input
                                                type="text"
                                                value={inputDecrypt.key}
                                                onChange={(e) => setInputDecrypt({ ...inputDecrypt, key: e.target.value })}
                                                placeholder="Nhập key"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">IV</label>
                                            <input
                                                type="text"
                                                value={inputDecrypt.iv}
                                                onChange={(e) => setInputDecrypt({ ...inputDecrypt, iv: e.target.value })}
                                                placeholder="Nhập IV"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end pt-2">
                                        <button
                                            className="py-2 px-6 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                            onClick={handleDecryptFile}
                                        >
                                            Giải mã
                                        </button>
                                    </div>
                                </div>

                                {decryptedData && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-medium mb-2 text-gray-800">Dữ liệu đã giải mã:</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {selectedFile?.type === 'text/plain' ? (
                                                <p className="font-mono text-sm break-all whitespace-pre-wrap">{new TextDecoder().decode(new Uint8Array(decryptedData))}</p>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="mb-3">Đã giải mã thành công!</p>
                                                    {selectedFile?.type.startsWith('image/') ? (
                                                        <div className="mt-2">
                                                            <p className="mb-2">Xem trước:</p>
                                                            <img
                                                                src={URL.createObjectURL(new Blob([decryptedData], { type: selectedFile.type }))}
                                                                alt="Decrypted image"
                                                                className="max-w-full h-auto rounded-md border border-gray-300"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="mt-2 py-1.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                                            onClick={() => {
                                                                const url = URL.createObjectURL(new Blob([decryptedData], { type: selectedFile?.type || 'application/octet-stream' }));
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `decrypted-${selectedFile?.name || 'file'}`;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                a.remove();
                                                            }}
                                                        >
                                                            Tải xuống file
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'sign' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Tạo chữ ký số</h2>
                                <p className="text-sm text-gray-600 mb-4">Chức năng này sẽ được phát triển sau.</p>
                            </div>
                        )}

                        {activeTab === 'verify' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Xác minh chữ ký số</h2>
                                <p className="text-sm text-gray-600 mb-4">Chức năng này sẽ được phát triển sau.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCryptographyTool;
