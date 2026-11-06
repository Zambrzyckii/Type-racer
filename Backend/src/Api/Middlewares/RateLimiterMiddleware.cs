using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace TypeRacerServer.Api.Middlewares;

public static class RateLimiterMiddleware
{
    public static IServiceCollection CustomRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            
            options.AddFixedWindowLimiter(policyName: "RateLimiter", limiterOptions =>
            {
                limiterOptions.PermitLimit = 5;
                limiterOptions.Window = TimeSpan.FromSeconds(10);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 0;
            });
        });
        
        return services;
    }
}