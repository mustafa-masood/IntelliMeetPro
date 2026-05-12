using System.Threading.Channels;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingAnalysisQueue : IMeetingAnalysisQueue
{
    private readonly Channel<MeetingAnalysisWorkItem> _channel = Channel.CreateUnbounded<MeetingAnalysisWorkItem>(new UnboundedChannelOptions
    {
        SingleReader = true,
        SingleWriter = false
    });

    internal ChannelReader<MeetingAnalysisWorkItem> Reader => _channel.Reader;

    public ValueTask EnqueueAsync(Guid meetingId, bool force, CancellationToken ct) =>
        _channel.Writer.WriteAsync(new MeetingAnalysisWorkItem(meetingId, force), ct);
}

internal readonly record struct MeetingAnalysisWorkItem(Guid MeetingId, bool Force);
