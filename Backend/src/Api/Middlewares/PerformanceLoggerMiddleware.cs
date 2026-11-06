
namespace TypeRacerServer.Api.Middlewares;
public class PerformanceLoggerMiddleware(RequestDelegate _next, ILogger<PerformanceLoggerMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();

        await _next(context);
        
        watch.Stop();

        if (watch.ElapsedMilliseconds > 500)
        {
            logger.LogInformation("Request took {ElapsedMilliseconds} ms", watch.ElapsedMilliseconds);
        }
    }
}