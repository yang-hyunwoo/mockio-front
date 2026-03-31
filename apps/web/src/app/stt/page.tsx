"use client"

import { useRef, useState } from "react"

export default function SpeechRecorder() {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)

    const [isRecording, setIsRecording] = useState(false)
    const [resultText, setResultText] = useState("")
    const [loading, setLoading] = useState(false)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : ""

            const mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream)

            chunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, {
                    type: mimeType || "audio/webm",
                })

                const formData = new FormData()
                formData.append("file", audioBlob, "answer.webm")

                setLoading(true)
                try {
                    const response = await fetch("/api/stt", {
                        method: "POST",
                        body: formData,
                    })

                    if (!response.ok) {
                        throw new Error("STT 요청 실패")
                    }

                    const data = await response.json()
                    setResultText(data.text ?? "")
                } catch (error) {
                    console.error(error)
                    alert("음성 변환 중 오류가 발생했습니다.")
                } finally {
                    setLoading(false)
                }

                streamRef.current?.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error(error)
            alert("마이크 권한을 확인해주세요.")
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current = null
        setIsRecording(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {!isRecording ? (
                    <button onClick={startRecording} className="px-4 py-2 bg-blue-600 text-white rounded">
                        녹음 시작
                    </button>
                ) : (
                    <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded">
                        녹음 종료
                    </button>
                )}
            </div>

            {loading && <p>음성을 텍스트로 변환 중입니다...</p>}

            <div>
                <h3 className="font-bold mb-2">변환 결과</h3>
                <textarea
                    className="w-full min-h-[160px] border rounded p-3"
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    placeholder="여기에 STT 결과가 표시됩니다."
                />
            </div>
        </div>
    )
}