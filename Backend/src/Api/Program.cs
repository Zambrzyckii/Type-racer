using TypeRacerServer;
using Microsoft.EntityFrameworkCore;
using TypeRacerServer.Api.Extensions;
using TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;
using TypeRacerServer.Core.Application.Interfaces.LeaderboardInterfaces;
using TypeRacerServer.Core.Application.Interfaces.SavingStatsInterfaces;
using TypeRacerServer.Core.Domain.Dependency;
using TypeRacerServer.Infrastructure.Persistance;
using TypeRacerServer.Infrastructure.Persistance.Repositories;
using TypeRacerServer.Api.Middlewares;
var builder = WebApplication.CreateBuilder(args);


string? jwtkey = builder.Configuration["JwtSettings:Key"];
if(string.IsNullOrEmpty(jwtkey)){
	throw new Exception("No jwt key");
}
builder.Services.AddAuthenticationCustom(jwtkey);
builder.Services.AddAuthorization();
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSignalR();
builder.Services.AddControllers();
//builder.Services.CustomRateLimiting();
builder.Services.AddScoped<ILoginRepository, LoginRepository>();
builder.Services.AddScoped<IRegisterRepository, RegisterRepository>();
builder.Services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
builder.Services.AddScoped<ISaveScoreRepository, SaveScoreRepository>();
builder.Services.AddCors(options =>
{
	options.AddPolicy("ReactPolicy", policy => 
	{
		policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
	});
});
builder.Services.AddCoreServices();
var app = builder.Build();



app.UseCors("ReactPolicy");
app.UseMiddleware<PerformanceLoggerMiddleware>();
//app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/gamehub");

using (var scope = app.Services.CreateScope()){
	var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	dbContext.Database.EnsureCreated();
}


app.Run();


