// Thành phần phóng đại ảnh theo vị trí con trỏ, dùng cho các màn hình cần
// kiểm tra chi tiết hình ảnh trước khi seller xác nhận kết quả AI.

"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionTemplate } from "motion/react"
import { cn } from "@/lib/utils"

interface Position {
  // Tọa độ ngang của kính lúp.
  x: number
  // Tọa độ dọc của kính lúp.
  y: number
}

interface LensProps {
  // Nội dung ảnh hoặc nội dung cần được phóng đại.
  children: React.ReactNode
  // Hệ số phóng đại.
  zoomFactor?: number
  // Kích thước vùng kính lúp.
  lensSize?: number
  // Vị trí kính lúp khi ở chế độ tĩnh.
  position?: Position
  // Vị trí mặc định trước khi người dùng di chuyển con trỏ.
  defaultPosition?: Position
  // Xác định kính lúp có đứng yên hay không.
  isStatic?: boolean
  // Thời lượng animation khi kính lúp xuất hiện.
  duration?: number
  // Màu vùng kính lúp.
  lensColor?: string
  // Nhãn accessibility của vùng kính lúp.
  ariaLabel?: string
  // Class tùy chọn để kính lúp phủ kín vùng preview.
  className?: string
}

// Hiển thị vùng kính lúp tương tác nhưng vẫn giữ nguyên nội dung ảnh gốc.
export function Lens({
  children,
  zoomFactor = 1.3,
  lensSize = 170,
  isStatic = false,
  position = { x: 0, y: 0 },
  defaultPosition,
  duration = 0.1,
  lensColor = "black",
  ariaLabel = "Zoom Area",
  className,
}: LensProps) {
  if (zoomFactor < 1) {
    throw new Error("zoomFactor must be greater than 1")
  }
  if (lensSize < 0) {
    throw new Error("lensSize must be greater than 0")
  }

  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState<Position>(position)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentPosition = useMemo(() => {
    if (isStatic) return position
    if (defaultPosition && !isHovering) return defaultPosition
    return mousePosition
  }, [isStatic, position, defaultPosition, isHovering, mousePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsHovering(false)
  }, [])

  const maskImage = useMotionTemplate`radial-gradient(circle ${
    lensSize / 2
  }px at ${currentPosition.x}px ${
    currentPosition.y
  }px, ${lensColor} 100%, transparent 100%)`

  const LensContent = useMemo(() => {
    const { x, y } = currentPosition

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.58 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration }}
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          transformOrigin: `${x}px ${y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    )
  }, [currentPosition, maskImage, zoomFactor, children, duration])

  return (
    <div
      ref={containerRef}
      className={cn("relative z-20 h-full w-full overflow-hidden rounded-xl", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
      {isStatic || defaultPosition ? (
        LensContent
      ) : (
        <AnimatePresence mode="popLayout">
          {isHovering && LensContent}
        </AnimatePresence>
      )}
    </div>
  )
}
