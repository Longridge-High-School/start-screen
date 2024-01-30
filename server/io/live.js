/**
 *
 * @param {import('socket.io').Server} io
 */
export const addLiveListeners = io => {
  io.on('connect', socket => {
    let type = 'user'
    let streamId = 0

    socket.on('join-live-stream', (id, username) => {
      streamId = id

      socket.join(`live:${id}`)
      io.to(`live:${id}:dash`).emit('user-connect', {
        id: socket.id,
        username,
        emoji: ''
      })
    })

    socket.on('join-live-stream-dashboard', id => {
      type = 'streamer'
      streamId = id

      socket.join(`live:${id}:dash`)
    })

    socket.on('emoji', emoji => {
      io.to(`live:${streamId}:dash`).emit('emoji', socket.id, emoji)

      setTimeout(() => {
        io.to(`live:${streamId}:dash`).emit('emoji', socket.id, '')
      }, 10000)
    })

    socket.on('disconnect', () => {
      if (type === 'user') {
        io.to(`live:${streamId}:dash`).emit('user-disconnect', socket.id)
      }
    })
  })
}
