using Microsoft.Extensions.DependencyInjection;
using TypeRacerServer.Core.Application.Services.AccountManager;
using TypeRacerServer.Core.Application.Services.GameManager;
using TypeRacerServer.Core.Application.Services.LeaderboardManager;
using TypeRacerServer.Core.Application.Services.PostGameManager;
using TypeRacerServer.Core.Application.Services.RoomManager;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Domain.Dependency;

public static class DependencyInjection
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        services.AddSingleton<GameState>();
        services.AddScoped<LoginService>();
        services.AddScoped<RegisterService>();
        services.AddTransient<JoinRoomService>();
        services.AddTransient<ChangeRoomSettingsService>();
        services.AddTransient<RestartGameService>();
        services.AddTransient<StartRoomGameService>();
        services.AddTransient<PowerUpService>();
        services.AddTransient<LeaderboardSerivce>();
        services.AddTransient<SendProgressService>();
        services.AddTransient<EndGameProcessService>();
        services.AddTransient<PerformCleanupService>();
        services.AddTransient<SaveScoreService>();

        return services;
    }
}